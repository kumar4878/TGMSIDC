import { Schema, model, type Document, type Types } from "mongoose";

export interface ITender extends Document {
  tenderNumber: string;
  indentId?: Types.ObjectId;
  equipmentName?: string;
  status: string;
  tenderInvitedDate?: Date;
  bidsReceivedDate?: Date;
  l1BidderName?: string;
  l1BidderAmount?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TenderSchema = new Schema<ITender>(
  {
    tenderNumber: { type: String, required: true, unique: true },
    indentId: { type: Schema.Types.ObjectId, ref: "Indent" },
    equipmentName: { type: String },
    status: { type: String, required: true, default: "invited" },
    tenderInvitedDate: { type: Date },
    bidsReceivedDate: { type: Date },
    l1BidderName: { type: String },
    l1BidderAmount: { type: Number },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Tender = model<ITender>("Tender", TenderSchema);
