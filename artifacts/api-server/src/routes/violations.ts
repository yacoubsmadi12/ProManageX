import { Router } from "express";
import { db, violationsTable, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/violations", async (req, res) => {
  try {
    const { userId, status, category } = req.query as Record<string, string>;
    let rows = await db
      .select({
        id: violationsTable.id,
        userId: violationsTable.userId,
        userName: sql<string>`${usersTable.firstName} || ' ' || ${usersTable.lastName}`,
        reportedById: violationsTable.reportedById,
        category: violationsTable.category,
        severity: violationsTable.severity,
        status: violationsTable.status,
        date: violationsTable.date,
        description: violationsTable.description,
        penalty: violationsTable.penalty,
        evidenceUrl: violationsTable.evidenceUrl,
        createdAt: violationsTable.createdAt,
      })
      .from(violationsTable)
      .leftJoin(usersTable, eq(violationsTable.userId, usersTable.id));
    if (userId) rows = rows.filter(r => r.userId === userId);
    if (status) rows = rows.filter(r => r.status === status);
    if (category) rows = rows.filter(r => r.category === category);
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Error listing violations");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/violations", async (req, res) => {
  try {
    const [violation] = await db.insert(violationsTable).values(req.body).returning();
    res.status(201).json(violation);
  } catch (err) {
    req.log.error({ err }, "Error creating violation");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/violations/stats", async (req, res) => {
  try {
    const all = await db.select().from(violationsTable);
    const categories = ["safety", "attendance", "conduct", "quality", "policy"];
    const severities = ["minor", "moderate", "major", "critical"];
    res.json({
      total: all.length,
      open: all.filter(v => v.status === "open").length,
      resolved: all.filter(v => v.status === "resolved").length,
      totalPenalties: all.reduce((sum, v) => sum + parseFloat(v.penalty || "0"), 0),
      byCategory: categories.map(cat => ({ category: cat, count: all.filter(v => v.category === cat).length })),
      bySeverity: severities.map(sev => ({ severity: sev, count: all.filter(v => v.severity === sev).length })),
    });
  } catch (err) {
    req.log.error({ err }, "Error getting violation stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/violations/:id", async (req, res) => {
  try {
    const [violation] = await db.select().from(violationsTable).where(eq(violationsTable.id, parseInt(req.params.id)));
    if (!violation) return res.status(404).json({ error: "Violation not found" });
    res.json(violation);
  } catch (err) {
    req.log.error({ err }, "Error getting violation");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/violations/:id", async (req, res) => {
  try {
    const [violation] = await db.update(violationsTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(violationsTable.id, parseInt(req.params.id)))
      .returning();
    if (!violation) return res.status(404).json({ error: "Violation not found" });
    res.json(violation);
  } catch (err) {
    req.log.error({ err }, "Error updating violation");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
