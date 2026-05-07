import { pgTable, text, serial, timestamp, integer, numeric, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { contractorsTable } from "./contractors";

export const contractsTable = pgTable("contracts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  contractorId: integer("contractor_id").notNull().references(() => contractorsTable.id),
  status: text("status").notNull().default("draft"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  value: numeric("value", { precision: 15, scale: 2 }).notNull(),
  paidAmount: numeric("paid_amount", { precision: 15, scale: 2 }),
  description: text("description"),
  fileUrl: text("file_url"),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

export const insertContractSchema = createInsertSchema(contractsTable).omit({ id: true, createdAt: true });
export type InsertContract = z.infer<typeof insertContractSchema>;
export type Contract = typeof contractsTable.$inferSelect;
