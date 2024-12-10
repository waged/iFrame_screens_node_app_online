import mongoose, { Schema } from "mongoose";
import { IData } from "../interfaces/IData";

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: IData[];
  imgId: string;
  age: number;
  resetKey: string;
  address: IData[];
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema: Schema = new Schema<IUser>(
  {
    firstName: { type: String, trim: true, required: true },
    lastName: { type: String, trim: true, required: true },
    email: { type: String, trim: true, required: true, unique: true },
    password: { type: String, required: true, minLength: 6 },
    phone: [{ type: Object }], // IData like this as we don't need schema for it
    imgId: { type: String },
    age: { type: Number },
    resetKey: {type: String},
    address: [{ type: Object }], 
  },
  {
    timestamps: true,
  }
);

// Exclude the password field
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password; 
  delete obj.resetKey; 
  return obj;
};

export const User = mongoose.model<IUser>("User", UserSchema);
