import { Schema, model, type Document } from "mongoose";

export interface IInstitution extends Document {
  institutionCode: string;
  name: string;
  type: string;
  district: string;
  address: string;
  superintendentName?: string;
  contactEmail?: string;
  createdAt: Date;
}

const InstitutionSchema = new Schema<IInstitution>(
  {
    institutionCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    district: { type: String, required: true },
    address: { type: String, required: true },
    superintendentName: { type: String },
    contactEmail: { type: String },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

export const Institution = model<IInstitution>("Institution", InstitutionSchema);
