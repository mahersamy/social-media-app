import { confirmEmailValidation } from './../../modules/auth/auth.validation';
import { Schema, model, HydratedDocument } from "mongoose";
import { Gender, IUser, UserRole } from "./user.interface";
import { BadRequestException } from "../../utils/response/error.response";
import HashUtil from "../../utils/security/hash.security";
import encryptionSecurity from "../../utils/security/encryption.security";
import { emailEvent } from '../../utils/events/email.event';

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, minlength: 2, maxlength: 25 },
    lastName: { type: String, required: true, minlength: 2, maxlength: 25 },
    slug: { type: String, minlength: 2, maxlength: 51 },
    email: { type: String, required: true, unique: true },
    age: { type: Number, required: true },
    phone: { type: String, required: true },
    profileImage: { type: String },
    coverImages: { type: [String], default: [] },
    password: { type: String, required: true },
    confirmOtp: { type: String },
    confirmOtpExpire: { type: Date },
    forgetOtp: { type: String },
    forgetOtpExpire: { type: Date },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    gender: { type: String, enum: Object.values(Gender) },
    isConfirmed: { type: Date },
    isForget: { type: Date },
    changeCredentioalsTime: { type: Date },
    twoStepVerify: { type: Boolean, default: false },
    twoStepVerifyOtp: { type: String },
    twoStepVerifyOtpExpire: { type: Date },
    confirmChangeEmailOtp: { type: String },
    confirmChangeEmailOtpExpire: { type: Date },
    freezedAt: { type: Date },
  },
  {
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

UserSchema.virtual("username").get(function () {
  return `${this.firstName} ${this.lastName}`.toLowerCase();
});

UserSchema.virtual("username").set(function (value) {
  this.firstName = value.split(" ")[0];
  this.lastName = value.split(" ")[1];
  this.slug = value.split(" ").join("-");
});

UserSchema.pre("save", async function (this:HUserDocument & {wasNew:boolean,confirmEmailPlainTextOtp?:string},next) {
  this.wasNew = this.isNew;
  if(this.isModified("phone")){
    this.phone = encryptionSecurity.encrypt(this.phone);
  }
  if (this.isModified("password")) {
    this.password = await HashUtil.hash(this.password);
  }
  if (this.isModified("phone")) {
    this.phone = encryptionSecurity.encrypt(this.phone);
  }
  if(this.isModified("confirmOtp")){
    this.confirmEmailPlainTextOtp = this.confirmOtp;
    this.confirmOtp = await HashUtil.hash(this.confirmOtp!);
  }
  next();
});

UserSchema.post("save", async function (doc,next) {
  const that=this as HUserDocument & {wasNew:boolean,confirmEmailPlainTextOtp?:string};
  if(that.wasNew && that.confirmEmailPlainTextOtp){
    emailEvent.emit("confirmEmail",that.email,that.confirmEmailPlainTextOtp!)
  }
  next();
})

UserSchema.pre(["find","findOne"],async function (next) {
  const query=this.getQuery();
  if(query.pranoid===false){
    this.setQuery({...query})
  }else{
      this.setQuery({...query,freezedAt:{$exists:false}})

  }
  next();
});



const UserModel = model<IUser>("User", UserSchema);

export type HUserDocument = HydratedDocument<IUser>;

export default UserModel;
