import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const rateContractsTable = pgTable("rate_contracts", {
  id: serial("id").primaryKey(),
  contractNumber: text("contract_number").notNull().unique(),
  equipmentId: integer("equipment_id").notNull(),
  vendorId: integer("vendor_id").notNull(),
  unitPrice: real("unit_price").notNull(),
  gstRate: real("gst_rate").notNull(),
  warrantyYears: integer("warranty_years").notNull(),
  cmcCharges: real("cmc_charges").notNull(),
  cmcStartYear: integer("cmc_start_year").notNull(),
  status: text("status").notNull().default("active"),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertRateContractSchema = createInsertSchema(rateContractsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertRateContract = z.infer<typeof insertRateContractSchema>;
export type RateContract = typeof rateContractsTable.$inferSelect;
