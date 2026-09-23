import { Schema, model, type Document, type Types } from "mongoose";

export interface IPurchaseOrder extends Document {
  poNumber: string;
  indentId: Types.ObjectId;
  rateContractId: Types.ObjectId;
  vendorId: Types.ObjectId;
  equipmentId: Types.ObjectId;
  quantity: number;
  unitPrice: number;
  gstRate: number;
  totalAmount: number;
  status: string;
  deliveryAddress: string;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  cancellationReason?: string;
  cancelledBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    poNumber: { type: String, required: true, unique: true },
    indentId: { type: Schema.Types.ObjectId, ref: "Indent", required: true },
    rateContractId: { type: Schema.Types.ObjectId, ref: "RateContract", required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    equipmentId: { type: Schema.Types.ObjectId, ref: "Equipment", required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    gstRate: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    status: { type: String, required: true, default: "draft" },
    deliveryAddress: { type: String, required: true },
    expectedDeliveryDate: { type: Date },
    actualDeliveryDate: { type: Date },
    cancellationReason: { type: String },
    cancelledBy: { type: String },
  },
  { timestamps: true }
);

export const PurchaseOrder = model<IPurchaseOrder>("PurchaseOrder", PurchaseOrderSchema);
