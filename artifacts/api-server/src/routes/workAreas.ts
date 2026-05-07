import { Router } from "express";
import { db, workAreasTable, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/work-areas", async (req, res) => {
  try {
    const { status, search } = req.query as Record<string, string>;
    let rows = await db
      .select({
        id: workAreasTable.id,
        name: workAreasTable.name,
        location: workAreasTable.location,
        description: workAreasTable.description,
        supervisorId: workAreasTable.supervisorId,
        supervisorName: sql<string | null>`${usersTable.firstName} || ' ' || ${usersTable.lastName}`,
        status: workAreasTable.status,
        progress: workAreasTable.progress,
        latitude: workAreasTable.latitude,
        longitude: workAreasTable.longitude,
        teamSize: workAreasTable.teamSize,
        createdAt: workAreasTable.createdAt,
      })
      .from(workAreasTable)
      .leftJoin(usersTable, eq(workAreasTable.supervisorId, usersTable.id));
    if (status) rows = rows.filter(r => r.status === status);
    if (search) rows = rows.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.location.toLowerCase().includes(search.toLowerCase()));
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Error listing work areas");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/work-areas", async (req, res) => {
  try {
    const [area] = await db.insert(workAreasTable).values(req.body).returning();
    res.status(201).json(area);
  } catch (err) {
    req.log.error({ err }, "Error creating work area");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/work-areas/:id", async (req, res) => {
  try {
    const [area] = await db.select().from(workAreasTable).where(eq(workAreasTable.id, parseInt(req.params.id)));
    if (!area) return res.status(404).json({ error: "Work area not found" });
    res.json(area);
  } catch (err) {
    req.log.error({ err }, "Error getting work area");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/work-areas/:id", async (req, res) => {
  try {
    const [area] = await db.update(workAreasTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(workAreasTable.id, parseInt(req.params.id)))
      .returning();
    if (!area) return res.status(404).json({ error: "Work area not found" });
    res.json(area);
  } catch (err) {
    req.log.error({ err }, "Error updating work area");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/work-areas/:id", async (req, res) => {
  try {
    await db.delete(workAreasTable).where(eq(workAreasTable.id, parseInt(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting work area");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
