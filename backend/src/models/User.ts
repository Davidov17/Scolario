import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isAdmin: boolean;
  isVerified: boolean;
  verificationCode?: string;
  verificationCodeExpiry?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName:  { type: String, required: true },
    email:     { type: String, required: true, unique: true, lowercase: true },
    password:  { type: String, required: true },
    isAdmin:   { type: Boolean, default: false },
    // true for all existing users; set to false on new signups until email verified
    isVerified: { type: Boolean, default: true },
    verificationCode:       { type: String },
    verificationCodeExpiry: { type: Date },
    resetToken:       { type: String },
    resetTokenExpiry: { type: Date },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser>("User", UserSchema);
