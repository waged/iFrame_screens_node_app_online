import mongoose, { Schema, Document } from "mongoose";
import { IData } from "../interfaces/IData";
import crypto from "crypto";

export interface IProduct {
  ownerID: string;
  companyID: string;
  name: string;
  commercialName: string;
  linkedQR: string;
  autoQR: string;
  material: string;
  producer: IData;
  suppliers: [IData];
  origin: string;
  category: String;
  components: [IData];
  price: number;
  profitPercent: number;
  manufactureYear: number;
  productionYear: number;
  isUsed: boolean;
  weight: number;
  stock: number;
  dimensions: [IData];
  sizes: [IData];
  purity: number;
  description?: string;
  imagesID?: string[];
  videosID?: string[];
}

export const ProductSchema: Schema = new Schema<IProduct>({
  ownerID: { type: String, required: true },
  companyID: { type: String, required: true },
  name: { type: String, required: true, trim: true, unique:true },
  producer: { type: Object, required: true, },
  price: { type: Number, required: true, min: 0 },
  profitPercent: { type: Number, required: true, min: 0, max: 100 },
  manufactureYear: { type: Number, required: true },
  productionYear: { type: Number, required: true },
  stock: { type: Number, required: true, min: 0 },
  weight: { type: Number, min: 0 },
  commercialName: { type: String, trim: true },
  linkedQR: { type: String, trim: true },
  autoQR: { type: String, trim: true, unique:true, default: () => crypto.randomBytes(16).toString("hex") },
  material: { type: String, trim: true },
  suppliers: [{ type: Object }],
  origin: { type: String, trim: true },
  category: { type: String, trim: true },
  components: [{ type: Object }],
  isUsed: { type: Boolean, default: false },
  dimensions: [{ type: Object }],
  sizes: [{ type: Object }],
  purity: { type: Number, min: 0, max: 100 },
  description: { type: String },
  imagesID: [{ type: String }],
  videosID: [{ type: String }],
});
export const Product = mongoose.model<IProduct>("Product", ProductSchema);