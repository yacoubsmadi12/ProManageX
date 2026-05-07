import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/notifications", async (req, res) => {
  try {
    const { unreadOnly } = req.query as Record<string, string>;
    let rows = await db.select().from(notificationsTable).orderBy(sql`${notificationsTable.createdAt} DESC`);
    if (unreadOnly === "true") rows = rows.filter(n => !n.read);
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Error listing notifications");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/notifications/:id/read", async (req, res) => {
  try {
    const [notification] = await db.update(notificationsTable)
      .set({ read: true })
      .where(eq(notificationsTable.id, parseInt(req.params.id)))
      .returning();
    if (!notification) return res.status(404).json({ error: "Notification not found" });
    res.json(notification);
  } catch (err) {
    req.log.error({ err }, "Error marking notification read");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/notifications/read-all", async (req, res) => {
  try {
    await db.update(notificationsTable).set({ read: true });
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Error marking all notifications read");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
