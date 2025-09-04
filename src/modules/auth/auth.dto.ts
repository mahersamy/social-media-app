export interface ISignupBodyInputDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  age:number;
  gender:string
}
export interface ISigninBodyInputDTO {
  email: string;
  password: string;

}

export interface IConfirmEmailDTO {
  email: string;
  otp: string;

}

export interface IForgetPassword {
  email: string;
  
}

export interface IResetForgetPassword {
  email: string;
  otp: string;
  newPassword:string;

  
}
