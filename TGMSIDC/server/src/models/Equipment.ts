import { Schema, model, type Document } from "mongoose";

export interface IEquipment extends Document {
  equipmentCode: string;
  name: string;
  category: string;
  specifications: string;
  gstRate: number;
  standardised: boolean;
  createdAt: Date;
}

const EquipmentSchema = new Schema<IEquipment>(
  {
    equipmentCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    specifications: { type: String, required: true },
    gstRate: { type: Number, required: true, default: 12 },
    standardised: { type: Boolean, required: true, default: true },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

export const Equipment = model<IEquipment>("Equipment", EquipmentSchema);
