import { Schema, model, type Document } from "mongoose";

export interface IVendor extends Document {
  vendorCode: string;
  name: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  gstNumber: string;
  isL1Bidder: boolean;
  performanceScore?: number;
  status: string;
  createdAt: Date;
}

const VendorSchema = new Schema<IVendor>(
  {
    vendorCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    address: { type: String, required: true },
    gstNumber: { type: String, required: true },
    isL1Bidder: { type: Boolean, required: true, default: false },
    performanceScore: { type: Number },
    status: { type: String, required: true, default: "active" },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

export const Vendor = model<IVendor>("Vendor", VendorSchema);
