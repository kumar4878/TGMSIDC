import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const purchaseOrdersTable = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  poNumber: text("po_number").notNull().unique(),
  indentId: integer("indent_id").notNull(),
  rateContractId: integer("rate_contract_id").notNull(),
  vendorId: integer("vendor_id").notNull(),
  equipmentId: integer("equipment_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
  gstRate: real("gst_rate").notNull(),
  totalAmount: real("total_amount").notNull(),
  status: text("status").notNull().default("draft"),
  deliveryAddress: text("delivery_address").notNull(),
  expectedDeliveryDate: timestamp("expected_delivery_date", { withTimezone: true }),
  actualDeliveryDate: timestamp("actual_delivery_date", { withTimezone: true }),
  cancellationReason: text("cancellation_reason"),
  cancelledBy: text("cancelled_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrdersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type PurchaseOrder = typeof purchaseOrdersTable.$inferSelect;
