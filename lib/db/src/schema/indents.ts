import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const indentsTable = pgTable("indents", {
  id: serial("id").primaryKey(),
  indentNumber: text("indent_number").notNull().unique(),
  facilityId: integer("facility_id").notNull(),
  equipmentId: integer("equipment_id").notNull(),
  quantity: integer("quantity").notNull(),
  technicalRequirements: text("technical_requirements").notNull(),
  status: text("status").notNull().default("draft"),
  procurementMode: text("procurement_mode"),
  rateContractId: integer("rate_contract_id"),
  tenderId: integer("tender_id"),
  rejectionReason: text("rejection_reason"),
  digitisedBy: text("digitised_by").notNull(),
  approvedBy: text("approved_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertIndentSchema = createInsertSchema(indentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertIndent = z.infer<typeof insertIndentSchema>;
export type Indent = typeof indentsTable.$inferSelect;
