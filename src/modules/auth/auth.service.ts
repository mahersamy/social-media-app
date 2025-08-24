import type { Request, Response } from "express";
import { ISignupBodyInputDTO } from "./auth.dto";
import * as validators from "./auth.validation";
import {
  ApplicationException,
  BadRequestException,
} from "../../utils/response/error.response";
import { emailEvent } from "../../utils/events/email.event";
import UserModel from "../../DB/models/user.model";

class AuthService {
  confirmEmail = async (req: Request, res: Response): Promise<Response> => {
    const { email, otp } = req.body;
    const validationResult = validators.confirmEmailValidation.body.safeParse(
      req.body
    );
    if (!validationResult.success) {
      throw new BadRequestException("Validation Error", {
        issues: validationResult.error.issues,
      });
    }
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new ApplicationException("User not found", 404);
    }
    if (user.isConfirmed) {
      throw new BadRequestException("Email already confirmed");
    }
    if (user.confirmOtp !== otp) {
      throw new BadRequestException("Invalid OTP");
    }

    await UserModel.updateOne(
      { _id: user._id },
      { $set: { isConfirmed: new Date() } }
    );
    
    return res.json({ message: "Email confirmed successfully" });
  };

  signup = async (req: Request, res: Response): Promise<Response> => {
    const validationResult = validators.signupValidation.body.safeParse(
      req.body
    );
    if (!validationResult.success) {
      throw new BadRequestException("Validation Error", {
        issues: validationResult.error.issues, 
      });
    }

    const data: ISignupBodyInputDTO = req.body;

    const existingUser = await UserModel.findOne({ email: data.email });

    if (existingUser) {
      throw new ApplicationException("Email already exists", 409);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await UserModel.create({
      ...data,
      confirmOtp: otp,
    });

    emailEvent.emit("confirmEmail", data.email, otp);

    return res.json({ message: "Signup Success", user });
  };

  signin = async (req: Request, res: Response): Promise<Response> => {
    const validationResult = validators.signinValidation.body.safeParse(
      req.body
    );
    if (!validationResult.success) {
      throw new BadRequestException("Validation Error", {
        issues: validationResult.error.issues, 
      });
    }
    const data: ISignupBodyInputDTO = req.body;

    const user = await UserModel.findOne({ email: data.email });
    
    if (!user) {
      throw new ApplicationException("Invalid credentials", 401);
    }
    
    if (!user.isConfirmed) {
      throw new ApplicationException(
        "Please confirm your email before logging in.",
        403
      );
    }

    return res.json({ message: "Signin Success", user });
  };
}

export default new AuthService();