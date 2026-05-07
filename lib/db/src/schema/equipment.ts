import { pgTable, text, serial, timestamp, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const equipmentTable = pgTable("equipment", {
  id: serial("id").primaryKey(),
  equipmentCode: text("equipment_code").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  specifications: text("specifications").notNull(),
  standardised: boolean("standardised").notNull().default(false),
  gstRate: real("gst_rate").notNull().default(12),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertEquipmentSchema = createInsertSchema(equipmentTable).omit({ id: true, createdAt: true });
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;
export type Equipment = typeof equipmentTable.$inferSelect;
