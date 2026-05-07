import { pgTable, text, varchar, serial, timestamp, numeric, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./auth";
import { workAreasTable } from "./workAreas";

export const equipmentTable = pgTable("equipment", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  serialNumber: text("serial_number"),
  type: text("type").notNull(),
  category: text("category").notNull().default("inventory"),
  status: text("status").notNull().default("available"),
  condition: text("condition").notNull().default("good"),
  workAreaId: serial("work_area_id").references(() => workAreasTable.id),
  assignedToId: varchar("assigned_to_id").references(() => usersTable.id),
  value: numeric("value", { precision: 12, scale: 2 }),
  purchaseDate: date("purchase_date"),
  lastMaintenanceDate: date("last_maintenance_date"),
  nextMaintenanceDate: date("next_maintenance_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

export const insertEquipmentSchema = createInsertSchema(equipmentTable).omit({ id: true, createdAt: true });
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;
export type Equipment = typeof equipmentTable.$inferSelect;
