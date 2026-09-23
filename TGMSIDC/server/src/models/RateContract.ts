import { Schema, model, type Document, type Types } from "mongoose";

export interface IRateContract extends Document {
  contractNumber: string;
  equipmentId: Types.ObjectId;
  vendorId: Types.ObjectId;
  unitPrice: number;
  gstRate: number;
  warrantyYears: number;
  cmcCharges: number;
  cmcStartYear: number;
  status: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RateContractSchema = new Schema<IRateContract>(
  {
    contractNumber: { type: String, required: true, unique: true },
    equipmentId: { type: Schema.Types.ObjectId, ref: "Equipment", required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    unitPrice: { type: Number, required: true },
    gstRate: { type: Number, required: true, default: 12 },
    warrantyYears: { type: Number, required: true },
    cmcCharges: { type: Number, required: true },
    cmcStartYear: { type: Number, required: true },
    status: { type: String, required: true, default: "active" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export const RateContract = model<IRateContract>("RateContract", RateContractSchema);
