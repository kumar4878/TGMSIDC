import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const institutionsTable = pgTable("institutions", {
  id: serial("id").primaryKey(),
  institutionCode: text("institution_code").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  district: text("district").notNull(),
  address: text("address").notNull(),
  superintendentName: text("superintendent_name"),
  contactEmail: text("contact_email"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertInstitutionSchema = createInsertSchema(institutionsTable).omit({ id: true, createdAt: true });
export type InsertInstitution = z.infer<typeof insertInstitutionSchema>;
export type Institution = typeof institutionsTable.$inferSelect;
