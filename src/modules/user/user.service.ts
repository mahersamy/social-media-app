import { type NextFunction, type Response, type Request } from "express";
import { IConfirmUpdateEmail, ILogoutDto, IUpdateEmail } from "./user.dto";
import { logoutEnum } from "../../utils/security/token.security";
import UserModel, { HUserDocument } from "../../DB/models/user.model";
import { UpdateQuery } from "mongoose";
import { IUser } from "../../DB/models/user.interface";
import { UserRepository } from "../../DB/repository/user.repository";
import { TokenRepository } from "../../DB/repository/token.repository";
import TokenModel from "../../DB/models/token.model";
import TokenUtil from "../../utils/security/token.security";
import { emailEvent } from "../../utils/events/email.event";
import HashUtil from "../../utils/security/hash.security";
import { generateOtp } from "../../utils/security/otp.util";
import { BadRequestException } from "../../utils/response/error.response";

class UserService {
  private userRepo = new UserRepository(UserModel);
  private tokenRepo = new TokenRepository(TokenModel);

  profile = async (req: Request, res: Response, next: NextFunction) => {
    return res.json({ message: "success", user: req.user, decode: req.decode });
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    const { flag }: ILogoutDto = req.body;
    const update: UpdateQuery<IUser> = {};

    switch (flag) {
      case logoutEnum.only:
        await this.tokenRepo.create({
          data: [
            {
              userId: req.user!._id,
              jti: req.decode?.jti as string,
              expiresAt: new Date(req.decode!.exp! * 1000),
              revoked: true,
            },
          ],
        });
        break;

      case logoutEnum.all:
        update.changeCredentioalsTime = new Date();
        break;
    }

    if (Object.keys(update).length > 0) {
      await this.userRepo.updateOneUser({
        filter: { _id: req.user!._id },
        update,
      });
    }

    return res.json({ message: "success" });
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    await this.tokenRepo.create({
      data: [
        {
          userId: req.user!._id,
          jti: req.decode?.jti as string,
          expiresAt: new Date(req.decode!.exp! * 1000),
          revoked: true,
        },
      ],
    });
    const { accessToken, refreshToken } =
      await TokenUtil.createLoginCredentioals(req.user as HUserDocument);

    return res.json({ message: "Signin Success", accessToken, refreshToken });
  };

  uploadProfileImage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    await this.userRepo.updateOneUser({
      filter: { _id: req.user!._id },
      update: {
        profileImage: req.file?.path,
      },
    });

    return res.json({ message: "uploaded success Success", file: req.file });
  };

  uploadCoverImage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    let arrOfDestinationPath = [];
    for (const file of req.files as Express.Multer.File[]) {
      arrOfDestinationPath.push(file.path);
    }

    await this.userRepo.updateOneUser({
      filter: { _id: req.user!._id },
      update: {
        coverImages: arrOfDestinationPath as string[],
      },
    });

    return res.json({ message: "uploaded success Success", file: req.files });
  };

  updateEmail = async (req: Request, res: Response, next: NextFunction) => {
    const data: IUpdateEmail = req.body;

    const { otp, hashOtp, otpExpire } = await generateOtp();
    await this.userRepo.findOneAndUpdate({
      filter: { _id: req.user!._id },
      update: {
        confirmChangeEmailOtp: hashOtp,
        confirmChangeEmailOtpExpire: otpExpire,
      },
    });
    emailEvent.emit("confirmEmail", data.newEmail, otp);
    return res.json({ message: "Please verify your new email" });
  };

  confirmUpdateEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const data: IConfirmUpdateEmail = req.body;

    // Check OTP expiry
    if (
      !req.user?.confirmChangeEmailOtpExpire ||
      req.user.confirmChangeEmailOtpExpire < new Date()
    ) {
      throw new BadRequestException("OTP expired, please request a new one");
    }
    const otpVerify = await HashUtil.verify(
      req.user?.confirmChangeEmailOtp!,
      data.otp
    );
    if (otpVerify) {
      await this.userRepo.findOneAndUpdate({
        filter: { _id: req.user!._id },
        update: {
          email: data.newEmail,
          confirmChangeEmailOtp: null,
          confirmChangeEmailOtpExpire: null,
        },
      });
      return res.json({ message: "change email successfuly" });
    } else {
      return res.status(400).json({ message: "Invalid OTP" });
    }
  };

  updateBasicProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { firstName, lastName, username, age, phone, gender } = req.body;
    const update: Partial<IUser> = {};

    if (username) {
      update.username = username;
      update.slug = username.split(" ").join("-");
      update.firstName = username.split(" ")[0];
      update.lastName = username.split(" ")[1] || "";
    }
    if (firstName) update.firstName = firstName;
    if (lastName) update.lastName = lastName;
    if (typeof age !== "undefined") update.age = age;
    if (phone) update.phone = phone;
    if (gender) update.gender = gender;

    await this.userRepo.updateOne({
      filter: { _id: req.user!._id },
      update,
    });

    return res.json({ message: "Profile updated successfully" });
  };
}

export default new UserService();
