import { pgTable, text, serial, timestamp, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const contractorsTable = pgTable("contractors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  companyName: text("company_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  nationalId: text("national_id"),
  taxNumber: text("tax_number"),
  classification: text("classification").notNull().default("tier2"),
  status: text("status").notNull().default("pending"),
  blacklisted: boolean("blacklisted").notNull().default(false),
  blacklistReason: text("blacklist_reason"),
  performanceScore: numeric("performance_score", { precision: 5, scale: 2 }),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

export const insertContractorSchema = createInsertSchema(contractorsTable).omit({ id: true, createdAt: true });
export type InsertContractor = z.infer<typeof insertContractorSchema>;
export type Contractor = typeof contractorsTable.$inferSelect;
