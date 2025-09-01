import type { Request, Response } from "express";
import {
  ISignupBodyInputDTO,
  IConfirmEmailDTO,
  ISigninBodyInputDTO,
} from "./auth.dto";
import {
  ApplicationException,
  BadRequestException,
  ConflictRequestException,
} from "../../utils/response/error.response";
import { emailEvent } from "../../utils/events/email.event";
import UserModel, { HUserDocument } from "../../DB/models/user.model";
import SymmetricCryptoUtil from "../../utils/security/encryption.security";
import HashUtil from "../../utils/security/hash.security";
import TokenUtil from "../../utils/security/token.security";
import { Gender } from "../../DB/models/user.interface";
import { UserRepository } from "../../DB/repository/user.repository";
import { v4 as uuidv4 } from "uuid";
import TokenModel from "../../DB/models/token.model";
import { TokenRepository } from "../../DB/repository/token.repository";


class AuthService {
  private userRepo = new UserRepository(UserModel);
  // private dataRepo = new DatabaseRepository(UserModel);

  signup = async (req: Request, res: Response): Promise<Response> => {
    const data: ISignupBodyInputDTO = req.body;

    const existingUser = await this.userRepo.findOne({filter:{email:data.email},options:{lean:true}});

    if (existingUser) {
      throw new ConflictRequestException("Email already exits")
    }

    // encryption
    const enryptedPhone = SymmetricCryptoUtil.encrypt(data.phone);

    // createOtp
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // hashing
    const otpHash = await HashUtil.hash(otp);
    const passwordHash = await HashUtil.hash(data.password);

    await this.userRepo.createUser({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        gender: data.gender as Gender,
        email: data.email,
        password: passwordHash,
        confirmOtp: otpHash,
        phone: enryptedPhone,
      },
    });

    emailEvent.emit("confirmEmail", data.email, otp);

    return res.status(201).json({ message: "Signup Success" });
  };

  signin = async (req: Request, res: Response): Promise<Response> => {
    const data: ISigninBodyInputDTO = req.body;

    const user = await this.userRepo.findOne({filter:{email:data.email}});

    if (!user) {
      throw new BadRequestException("Invalid Password Or Email");
    }

    // hashing

    const hashVerify = await HashUtil.verify(user.password, data.password);
    if (!hashVerify || !user) {
      throw new BadRequestException("Invalid Password Or Email");
    }

    if (!user.isConfirmed) {
      throw new ApplicationException(
        "Please confirm your email before logging in.",
        403
      );
    }
  
    const {accessToken,refreshToken}= await TokenUtil.createLoginCredentioals(user as HUserDocument);




    return res.json({ message: "Signin Success", accessToken,refreshToken });
  };

  confirmEmail = async (req: Request, res: Response): Promise<Response> => {
    const { email, otp }: IConfirmEmailDTO = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new ApplicationException("User not found", 404);
    }
    if (user.isConfirmed) {
      throw new BadRequestException("Email already confirmed");
    }

    const otpVerify = await HashUtil.verify(user.confirmOtp!, otp);

    if (!otpVerify) {
      throw new BadRequestException("Invalid OTP");
    }

    await UserModel.updateOne(
      { _id: user._id },
      { $set: { isConfirmed: new Date() }, $unset: { confirmOtp: "" } }
    );

    return res.json({ message: "Email confirmed successfully" });
  };
}

export default new AuthService();

