import { Types } from "mongoose";

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

export interface IUser {
  firstName: string;
  lastName: string;
  slug: string;
  email: string;
  age: number;
  phone: string;
  profileImage?: string;
  coverImages?: string[];
  password: string;
  username: string;
  confirmOtp?: string;
  confirmOtpExpire?: Date;
  confirmChangeEmailOtp?: string;
  confirmChangeEmailOtpExpire?: Date;
  twoStepVerifyOtp?: string;
  twoStepVerifyOtpExpire?: Date;
  forgetOtp?: string;
  forgetOtpExpire?: Date;
  isForget?: Date;
  role: UserRole;
  gender: Gender;
  isConfirmed?: Date;
  twoStepVerify?: boolean;
  changeCredentioalsTime?: Date;
  friends?: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
  freezedBy?: Types.ObjectId;
  freezedAt?: Date;

  restoredBy?: Types.ObjectId;
  restoredAt?: Date;

  deletedBy?: Types.ObjectId;
  deletedAt?: Date;
}
