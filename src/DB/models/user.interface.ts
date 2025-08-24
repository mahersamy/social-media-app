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
  password: string;
  username: string;
  confirmOtp?: string;
  role: UserRole;
  gender: Gender;
  isConfirmed:Date;
  createdAt?: Date;
  updatedAt?: Date;
}
