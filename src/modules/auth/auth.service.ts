import type { Request, Response } from "express";
import {
  ISignupBodyInputDTO,
  IConfirmEmailDTO,
  ISigninBodyInputDTO,
  IForgetPassword,
  IResetForgetPassword,
} from "./auth.dto";
import {
  ApplicationException,
  BadRequestException,
  ConflictRequestException,
  NotFoundRequestException,
} from "../../utils/response/error.response";
import { emailEvent } from "../../utils/events/email.event";
import UserModel, { HUserDocument } from "../../DB/models/user.model";
import SymmetricCryptoUtil from "../../utils/security/encryption.security";
import HashUtil from "../../utils/security/hash.security";
import { generateOtp } from "../../utils/security/otp.util";
import TokenUtil from "../../utils/security/token.security";
import { Gender } from "../../DB/models/user.interface";
import { UserRepository } from "../../DB/repository/user.repository";

class AuthService {
  private userRepo = new UserRepository(UserModel);

  signup = async (req: Request, res: Response) => {
    const data: ISignupBodyInputDTO = req.body;

    const existingUser = await this.userRepo.findOne({
      filter: { email: data.email },
      options: { lean: true },
    });

    if (existingUser) {
      throw new ConflictRequestException("Email already exits");
    }


    // createOtp
    const { otp, otpExpire } = await generateOtp();

    await this.userRepo.createUser({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        gender: data.gender as Gender,
        email: data.email,
        password: data.password,
        confirmOtp: otp,
        confirmOtpExpire: otpExpire,
        phone: data.phone,
      },
    });

    return res.status(201).json({ message: "Signup Success" });
  };

  signin = async (req: Request, res: Response) => {
    const data: ISigninBodyInputDTO = req.body;
    const user = await this.userRepo.findOne({ filter: { email: data.email } });

    if (!user) {
      throw new BadRequestException("Invalid Password Or Email");
    }

    // hashing

    const hashVerify = await HashUtil.verify(user.password, data.password);
    if (!hashVerify || !user) {
      throw new BadRequestException("Invalid Password Or Email");
    }

    if (user.twoStepVerify) {
      // createOtp
      const { otp, hashOtp, otpExpire } = await generateOtp();
      await this.userRepo.updateOne({
        filter: { email: user.email },
        update: {
          twoStepVerifyOtp: hashOtp,
          twoStepVerifyOtpExpire: otpExpire,
        },
      });
      emailEvent.emit("confirmEmail", data.email, otp);
      return res
        .status(201)
        .json({ message: "We sent you an OTP on your email" });
    }

    if (!user.isConfirmed) {
      throw new ApplicationException(
        "Please confirm your email before logging in.",
        403
      );
    }

    const { accessToken, refreshToken } =
      await TokenUtil.createLoginCredentioals(user as HUserDocument);

    return res.json({ message: "Signin Success", accessToken, refreshToken });
  };

  confirmEmail = async (req: Request, res: Response) => {
    const { email, otp }: IConfirmEmailDTO = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new ApplicationException("User not found", 404);
    }
    if (user.isConfirmed) {
      throw new BadRequestException("Email already confirmed");
    }

    // Check OTP expiry
    if (!user.confirmOtpExpire || user.confirmOtpExpire < new Date()) {
      throw new BadRequestException("OTP expired, please request a new one");
    }
    const otpVerify = await HashUtil.verify(user.confirmOtp!, otp);
    if (!otpVerify) {
      throw new BadRequestException("Invalid OTP");
    }
    await UserModel.updateOne(
      { _id: user._id },
      {
        $set: { isConfirmed: new Date() },
        $unset: { confirmOtp: "", confirmOtpExpire: "" },
      }
    );
    return res.json({ message: "Email confirmed successfully" });
  };

  // verifyTwoStep
  twoStepVerify = async (req: Request, res: Response) => {
    const { email, otp }: IConfirmEmailDTO = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new NotFoundRequestException("User not found");
    }

    if (
      !user.twoStepVerifyOtpExpire ||
      user.twoStepVerifyOtpExpire < new Date()
    ) {
      throw new BadRequestException("OTP expired, please request a new one");
    }
    const otpVerify = await HashUtil.verify(user.twoStepVerifyOtp!, otp);
    if (!otpVerify) {
      throw new BadRequestException("Invalid OTP");
    }
    if (user.twoStepVerify === false) {
      throw new BadRequestException("Step verification not enabled");
    }
    const { accessToken, refreshToken } =
      await TokenUtil.createLoginCredentioals(user as HUserDocument);
    return res
      .status(200)
      .json({ message: "Success", accessToken, refreshToken });
  };

  // Forget Passsword
  forgetPassword = async (req: Request, res: Response) => {
    const data: IForgetPassword = req.body;

    // createOtp
    const { otp, hashOtp, otpExpire } = await generateOtp();
    const user = await this.userRepo.updateOneUser({
      filter: { email: data.email },
      update: { $set: { forgetOtp: hashOtp, forgetOtpExpire: otpExpire } },
    });
    if (user.modifiedCount === 0) {
      throw new NotFoundRequestException("user not found");
    }
    emailEvent.emit("confirmEmail", data.email, otp);
    return res.status(201).json({ message: `Send Otp to email ${data.email}` });
  };

  verifyForgetPassword = async (req: Request, res: Response) => {
    const data: IConfirmEmailDTO = req.body;

    const user = await this.userRepo.findOne({ filter: { email: data.email } });

    if (!user) {
      throw new NotFoundRequestException("Please send email before verify");
    }

    if (!user.forgetOtpExpire || user.forgetOtpExpire < new Date()) {
      throw new BadRequestException("OTP expired, please request a new one");
    }
    const otpVerify = await HashUtil.verify(user.forgetOtp!, data.otp);
    if (!otpVerify) {
      throw new BadRequestException("Invalid OTP");
    }
    await this.userRepo.updateOne({
      filter: { email: data.email },
      update: { isForget: new Date() },
    });
    return res.status(201).json({
      message: `Success to verfiy Otp you have 5 min to reset password`,
    });
  };

  resetForgetPassword = async (req: Request, res: Response) => {
    const data: IResetForgetPassword = req.body;

    const user = await this.userRepo.findOne({ filter: { email: data.email } });

    if (!user) {
      throw new NotFoundRequestException("User not found");
    }

    if (!user.isForget) {
      throw new BadRequestException("No forget password request found");
    }

    const now = new Date().getTime();
    const issuedAt = new Date(user.isForget).getTime();
    const diff = now - issuedAt;

    if (diff > 5 * 60 * 1000) {
      throw new BadRequestException("OTP expired, please request a new one");
    }

    const hashVerify = await HashUtil.verify(user.forgetOtp!, data.otp);
    if (!hashVerify) {
      throw new BadRequestException("Invalid OTP");
    }

    const newPasswordHash = await HashUtil.hash(data.newPassword);

    await this.userRepo.updateOne({
      filter: { email: data.email },
      update: { password: newPasswordHash },
    });

    return res.status(200).json({ message: `Success` });
  };
}

export default new AuthService();
