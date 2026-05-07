import { Router } from "express";
import { db, equipmentTable, workAreasTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/equipment", async (req, res) => {
  try {
    const { type, status, search, workAreaId } = req.query as Record<string, string>;
    let rows = await db
      .select({
        id: equipmentTable.id,
        name: equipmentTable.name,
        serialNumber: equipmentTable.serialNumber,
        type: equipmentTable.type,
        category: equipmentTable.category,
        status: equipmentTable.status,
        condition: equipmentTable.condition,
        workAreaId: equipmentTable.workAreaId,
        workAreaName: workAreasTable.name,
        assignedToId: equipmentTable.assignedToId,
        value: equipmentTable.value,
        purchaseDate: equipmentTable.purchaseDate,
        lastMaintenanceDate: equipmentTable.lastMaintenanceDate,
        nextMaintenanceDate: equipmentTable.nextMaintenanceDate,
        notes: equipmentTable.notes,
        createdAt: equipmentTable.createdAt,
      })
      .from(equipmentTable)
      .leftJoin(workAreasTable, eq(equipmentTable.workAreaId, workAreasTable.id));
    if (type) rows = rows.filter(r => r.type === type);
    if (status) rows = rows.filter(r => r.status === status);
    if (workAreaId) rows = rows.filter(r => r.workAreaId === parseInt(workAreaId));
    if (search) rows = rows.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Error listing equipment");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/equipment", async (req, res) => {
  try {
    const [equipment] = await db.insert(equipmentTable).values(req.body).returning();
    res.status(201).json(equipment);
  } catch (err) {
    req.log.error({ err }, "Error creating equipment");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/equipment/stats", async (req, res) => {
  try {
    const all = await db.select().from(equipmentTable);
    const types = ["machinery", "vehicle", "tool", "it_equipment", "furniture", "other"];
    res.json({
      total: all.length,
      available: all.filter(e => e.status === "available").length,
      assigned: all.filter(e => e.status === "assigned").length,
      maintenance: all.filter(e => e.status === "maintenance").length,
      scrapped: all.filter(e => e.status === "scrapped").length,
      totalValue: all.reduce((sum, e) => sum + parseFloat(e.value || "0"), 0),
      byType: types.map(t => ({ type: t, count: all.filter(e => e.type === t).length })),
    });
  } catch (err) {
    req.log.error({ err }, "Error getting equipment stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/equipment/:id", async (req, res) => {
  try {
    const [equipment] = await db.select().from(equipmentTable).where(eq(equipmentTable.id, parseInt(req.params.id)));
    if (!equipment) return res.status(404).json({ error: "Equipment not found" });
    res.json(equipment);
  } catch (err) {
    req.log.error({ err }, "Error getting equipment");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/equipment/:id", async (req, res) => {
  try {
    const [equipment] = await db.update(equipmentTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(equipmentTable.id, parseInt(req.params.id)))
      .returning();
    if (!equipment) return res.status(404).json({ error: "Equipment not found" });
    res.json(equipment);
  } catch (err) {
    req.log.error({ err }, "Error updating equipment");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/equipment/:id", async (req, res) => {
  try {
    await db.delete(equipmentTable).where(eq(equipmentTable.id, parseInt(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting equipment");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
