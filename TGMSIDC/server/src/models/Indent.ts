import { Schema, model, type Document, type Types } from "mongoose";

export interface IIndent extends Document {
  indentNumber: string;
  facilityId: Types.ObjectId;
  equipmentId: Types.ObjectId;
  quantity: number;
  technicalRequirements: string;
  status: string;
  procurementMode?: string;
  rateContractId?: Types.ObjectId;
  tenderId?: Types.ObjectId;
  rejectionReason?: string;
  digitisedBy: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  approvalSteps: any[];
}

const ApprovalStepSchema = new Schema({
  stepNumber: { type: Number, required: true },
  requiredRole: { type: String, required: true },
  roleLabel: { type: String, required: true },
  assignedUserName: { type: String, required: true },
  assignedUserId: { type: String, required: true },
  status: { type: String, required: true, default: "pending" },
  actionedAt: { type: Date },
  comments: { type: String }
});

const IndentSchema = new Schema<IIndent>(
  {
    indentNumber: { type: String, required: true, unique: true },
    facilityId: { type: Schema.Types.ObjectId, ref: "Institution", required: true },
    equipmentId: { type: Schema.Types.ObjectId, ref: "Equipment", required: true },
    quantity: { type: Number, required: true },
    technicalRequirements: { type: String, required: true },
    status: { type: String, required: true, default: "draft" },
    procurementMode: { type: String },
    rateContractId: { type: Schema.Types.ObjectId, ref: "RateContract" },
    tenderId: { type: Schema.Types.ObjectId, ref: "Tender" },
    rejectionReason: { type: String },
    digitisedBy: { type: String, required: true },
    approvedBy: { type: String },
    approvalSteps: [ApprovalStepSchema],
  },
  { timestamps: true }
);

export const Indent = model<IIndent>("Indent", IndentSchema);
