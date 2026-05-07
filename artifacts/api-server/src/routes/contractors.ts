import { Router } from "express";
import { db, contractorsTable } from "@workspace/db";
import { eq, like, or, sql } from "drizzle-orm";

const router = Router();

router.get("/contractors", async (req, res) => {
  try {
    const { status, search, classification } = req.query as Record<string, string>;
    let contractors = await db.select().from(contractorsTable);
    if (status) contractors = contractors.filter(c => c.status === status);
    if (classification) contractors = contractors.filter(c => c.classification === classification);
    if (search) contractors = contractors.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.companyName.toLowerCase().includes(search.toLowerCase())
    );
    res.json(contractors);
  } catch (err) {
    req.log.error({ err }, "Error listing contractors");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/contractors", async (req, res) => {
  try {
    const [contractor] = await db.insert(contractorsTable).values(req.body).returning();
    res.status(201).json(contractor);
  } catch (err) {
    req.log.error({ err }, "Error creating contractor");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/contractors/stats", async (req, res) => {
  try {
    const all = await db.select().from(contractorsTable);
    const byClassification = ["tier1", "tier2", "tier3", "preferred", "blacklisted"].map(cls => ({
      classification: cls,
      count: all.filter(c => c.classification === cls).length,
    }));
    res.json({
      total: all.length,
      active: all.filter(c => c.status === "active").length,
      pending: all.filter(c => c.status === "pending").length,
      blacklisted: all.filter(c => c.blacklisted).length,
      byClassification,
    });
  } catch (err) {
    req.log.error({ err }, "Error getting contractor stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/contractors/:id", async (req, res) => {
  try {
    const [contractor] = await db.select().from(contractorsTable).where(eq(contractorsTable.id, parseInt(req.params.id)));
    if (!contractor) return res.status(404).json({ error: "Contractor not found" });
    res.json(contractor);
  } catch (err) {
    req.log.error({ err }, "Error getting contractor");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/contractors/:id", async (req, res) => {
  try {
    const [contractor] = await db.update(contractorsTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(contractorsTable.id, parseInt(req.params.id)))
      .returning();
    if (!contractor) return res.status(404).json({ error: "Contractor not found" });
    res.json(contractor);
  } catch (err) {
    req.log.error({ err }, "Error updating contractor");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/contractors/:id", async (req, res) => {
  try {
    await db.delete(contractorsTable).where(eq(contractorsTable.id, parseInt(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting contractor");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/contractors/:id/blacklist", async (req, res) => {
  try {
    const { blacklisted, reason } = req.body;
    const [contractor] = await db.update(contractorsTable)
      .set({ blacklisted, blacklistReason: reason ?? null, status: blacklisted ? "suspended" : "active", updatedAt: new Date() })
      .where(eq(contractorsTable.id, parseInt(req.params.id)))
      .returning();
    if (!contractor) return res.status(404).json({ error: "Contractor not found" });
    res.json(contractor);
  } catch (err) {
    req.log.error({ err }, "Error toggling blacklist");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
