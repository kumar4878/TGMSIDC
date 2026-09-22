import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tendersTable = pgTable("tenders", {
  id: serial("id").primaryKey(),
  tenderNumber: text("tender_number").notNull().unique(),
  indentId: integer("indent_id"),
  equipmentName: text("equipment_name"),
  status: text("status").notNull().default("invited"),
  tenderInvitedDate: timestamp("tender_invited_date", { withTimezone: true }),
  bidsReceivedDate: timestamp("bids_received_date", { withTimezone: true }),
  l1BidderName: text("l1_bidder_name"),
  l1BidderAmount: real("l1_bidder_amount"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertTenderSchema = createInsertSchema(tendersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTender = z.infer<typeof insertTenderSchema>;
export type Tender = typeof tendersTable.$inferSelect;
