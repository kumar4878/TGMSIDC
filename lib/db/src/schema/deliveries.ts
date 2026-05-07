import { pgTable, text, serial, timestamp, integer, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const deliveriesTable = pgTable("deliveries", {
  id: serial("id").primaryKey(),
  qrCode: text("qr_code").notNull().unique(),
  purchaseOrderId: integer("purchase_order_id").notNull(),
  vendorId: integer("vendor_id").notNull(),
  facilityId: integer("facility_id").notNull(),
  quantity: integer("quantity").notNull(),
  status: text("status").notNull().default("dispatched"),
  dispatchDate: timestamp("dispatch_date", { withTimezone: true }),
  deliveredDate: timestamp("delivered_date", { withTimezone: true }),
  qaComplianceScore: real("qa_compliance_score"),
  qaNotes: text("qa_notes"),
  discrepancyNotes: text("discrepancy_notes"),
  documentsUploaded: boolean("documents_uploaded").notNull().default(false),
  acceptanceCertificateIssued: boolean("acceptance_certificate_issued").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertDeliverySchema = createInsertSchema(deliveriesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDelivery = z.infer<typeof insertDeliverySchema>;
export type Delivery = typeof deliveriesTable.$inferSelect;
