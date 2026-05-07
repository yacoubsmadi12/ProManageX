import { Router } from "express";
import { db, reportsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/reports", async (req, res) => {
  try {
    const rows = await db.select().from(reportsTable);
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Error listing reports");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/reports", async (req, res) => {
  try {
    const [report] = await db.insert(reportsTable).values(req.body).returning();
    res.status(201).json(report);
  } catch (err) {
    req.log.error({ err }, "Error creating report");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
