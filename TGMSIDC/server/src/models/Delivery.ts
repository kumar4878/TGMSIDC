import { Schema, model, type Document, type Types } from "mongoose";

export interface IDelivery extends Document {
  qrCode: string;
  purchaseOrderId: Types.ObjectId;
  vendorId: Types.ObjectId;
  facilityId: Types.ObjectId;
  quantity: number;
  status: string;
  dispatchDate?: Date;
  deliveredDate?: Date;
  qaComplianceScore?: number;
  qaNotes?: string;
  discrepancyNotes?: string;
  documentsUploaded: boolean;
  acceptanceCertificateIssued: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DeliverySchema = new Schema<IDelivery>(
  {
    qrCode: { type: String, required: true, unique: true },
    purchaseOrderId: { type: Schema.Types.ObjectId, ref: "PurchaseOrder", required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    facilityId: { type: Schema.Types.ObjectId, ref: "Institution", required: true },
    quantity: { type: Number, required: true },
    status: { type: String, required: true, default: "dispatched" },
    dispatchDate: { type: Date },
    deliveredDate: { type: Date },
    qaComplianceScore: { type: Number },
    qaNotes: { type: String },
    discrepancyNotes: { type: String },
    documentsUploaded: { type: Boolean, required: true, default: false },
    acceptanceCertificateIssued: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

export const Delivery = model<IDelivery>("Delivery", DeliverySchema);
