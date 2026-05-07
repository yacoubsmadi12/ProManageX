import { pgTable, text, varchar, serial, timestamp, numeric, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./auth";

export const violationsTable = pgTable("violations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => usersTable.id),
  reportedById: varchar("reported_by_id").references(() => usersTable.id),
  category: text("category").notNull(),
  severity: text("severity").notNull().default("minor"),
  status: text("status").notNull().default("open"),
  date: date("date").notNull(),
  description: text("description").notNull(),
  penalty: numeric("penalty", { precision: 10, scale: 2 }),
  evidenceUrl: text("evidence_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

export const insertViolationSchema = createInsertSchema(violationsTable).omit({ id: true, createdAt: true });
export type InsertViolation = z.infer<typeof insertViolationSchema>;
export type Violation = typeof violationsTable.$inferSelect;
