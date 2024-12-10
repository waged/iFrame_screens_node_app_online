import mongoose, { Schema } from "mongoose";
import { IData } from "../interfaces/IData";

export interface ICompany {
  ownerID: string;
  name: string;
  commercialName: string;
  slogan: string;
  vat: string;
  category: string;
  industry: string;
  imgIds: string[];
  backgroundImg: string;
  mobile: IData[];
  address: IData[];
  phone: IData[];
  employees: IData[];
}

export const CompanySchema: Schema = new Schema<ICompany>({
  ownerID: { type: String, required: true },
  name: { type: String, required: true },
  commercialName: { type: String, required: true },
  slogan: { type: String },
  vat: { type: String },
  category: { type: String },
  industry: { type: String },
  imgIds: [{ type: String }],
  backgroundImg: { type: String },
  mobile: [{ type: Object }],
  address: [{ type: Object }],
  phone: [{ type: Object }],
  employees: [{ type: Object }],
});

export const Company = mongoose.model<ICompany>("Company", CompanySchema);
