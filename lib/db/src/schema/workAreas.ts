import { pgTable, text, varchar, serial, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./auth";

export const workAreasTable = pgTable("work_areas", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  description: text("description"),
  supervisorId: varchar("supervisor_id").references(() => usersTable.id),
  status: text("status").notNull().default("active"),
  progress: numeric("progress", { precision: 5, scale: 2 }).notNull().default("0"),
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),
  teamSize: serial("team_size"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

export const insertWorkAreaSchema = createInsertSchema(workAreasTable).omit({ id: true, createdAt: true });
export type InsertWorkArea = z.infer<typeof insertWorkAreaSchema>;
export type WorkArea = typeof workAreasTable.$inferSelect;
