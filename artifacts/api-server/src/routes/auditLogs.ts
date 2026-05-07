import { Router } from "express";
import { db, auditLogsTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router = Router();

router.get("/audit-logs", async (req, res) => {
  try {
    const { action, limit } = req.query as Record<string, string>;
    let rows = await db
      .select()
      .from(auditLogsTable)
      .orderBy(desc(auditLogsTable.createdAt))
      .limit(parseInt(limit || "100"));
    if (action) rows = rows.filter(r => r.action === action);
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Error listing audit logs");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
