import { pgTable, text, varchar, serial, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./auth";

export const evaluationsTable = pgTable("evaluations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => usersTable.id),
  evaluatorId: varchar("evaluator_id").references(() => usersTable.id),
  period: text("period").notNull(),
  kpiScore: numeric("kpi_score", { precision: 5, scale: 2 }),
  attendanceScore: numeric("attendance_score", { precision: 5, scale: 2 }),
  qualityScore: numeric("quality_score", { precision: 5, scale: 2 }),
  punctualityScore: numeric("punctuality_score", { precision: 5, scale: 2 }),
  overallScore: numeric("overall_score", { precision: 5, scale: 2 }).notNull(),
  status: text("status").notNull().default("draft"),
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

export const insertEvaluationSchema = createInsertSchema(evaluationsTable).omit({ id: true, createdAt: true });
export type InsertEvaluation = z.infer<typeof insertEvaluationSchema>;
export type Evaluation = typeof evaluationsTable.$inferSelect;
