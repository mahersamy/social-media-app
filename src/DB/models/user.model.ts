import { Schema, model } from "mongoose";
import { Gender, IUser, UserRole } from "./user.interface";

const UserSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  password: { type: String, required: true },
  confirmOtp: { type: String },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
  gender: { type: String, enum: Object.values(Gender) },
  isConfirmed: { type: Date},
  
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  timestamps: true

});

UserSchema.virtual("username")
  .get(function () {
    return `${this.firstName} ${this.lastName}`.toLowerCase();
  });

const UserModel = model("User", UserSchema);

export default UserModel;
