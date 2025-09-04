export enum UserRole {
  ADMIN = "admin",
  USER = "user"
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other"
}

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  phone:string;
  password: string;
  username: string;
  confirmOtp?: string;
  forgetOtp?: string;
  isForget?: Date;
  role: UserRole;
  gender: Gender;
  isConfirmed?:Date;
  changeCredentioalsTime?:Date;
  createdAt?: Date;
  updatedAt?: Date;
}
