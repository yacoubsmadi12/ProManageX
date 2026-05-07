import { Router } from "express";
import { db, attendanceTable, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/attendance", async (req, res) => {
  try {
    const { date, userId, workAreaId, status } = req.query as Record<string, string>;
    let rows = await db
      .select({
        id: attendanceTable.id,
        userId: attendanceTable.userId,
        userName: sql<string>`${usersTable.firstName} || ' ' || ${usersTable.lastName}`,
        workAreaId: attendanceTable.workAreaId,
        workAreaName: sql<string | null>`null`,
        date: attendanceTable.date,
        checkIn: attendanceTable.checkIn,
        checkOut: attendanceTable.checkOut,
        status: attendanceTable.status,
        overtimeHours: attendanceTable.overtimeHours,
        notes: attendanceTable.notes,
        createdAt: attendanceTable.createdAt,
      })
      .from(attendanceTable)
      .leftJoin(usersTable, eq(attendanceTable.userId, usersTable.id));
    if (date) rows = rows.filter(r => r.date === date);
    if (userId) rows = rows.filter(r => r.userId === userId);
    if (status) rows = rows.filter(r => r.status === status);
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Error listing attendance");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/attendance", async (req, res) => {
  try {
    const [record] = await db.insert(attendanceTable).values(req.body).returning();
    res.status(201).json(record);
  } catch (err) {
    req.log.error({ err }, "Error creating attendance");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/attendance/:id", async (req, res) => {
  try {
    const [record] = await db.update(attendanceTable)
      .set(req.body)
      .where(eq(attendanceTable.id, parseInt(req.params.id)))
      .returning();
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  } catch (err) {
    req.log.error({ err }, "Error updating attendance");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/attendance/today", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const rows = await db.select().from(attendanceTable).where(eq(attendanceTable.date, today));
    const total = await db.select().from(usersTable);
    res.json({
      date: today,
      present: rows.filter(r => r.status === "present").length,
      absent: rows.filter(r => r.status === "absent").length,
      late: rows.filter(r => r.status === "late").length,
      onLeave: rows.filter(r => r.status === "leave").length,
      total: total.length,
      attendanceRate: total.length > 0 ? (rows.filter(r => r.status === "present").length / total.length) * 100 : 0,
    });
  } catch (err) {
    req.log.error({ err }, "Error getting today attendance");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/attendance/stats", async (req, res) => {
  try {
    const rows = await db.select().from(attendanceTable);
    const total = rows.length || 1;
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayRows = rows.filter(r => r.date === dateStr);
      trend.push({ label: d.toLocaleDateString("en", { weekday: "short" }), value: dayRows.filter(r => r.status === "present").length });
    }
    res.json({
      presentRate: (rows.filter(r => r.status === "present").length / total) * 100,
      absentRate: (rows.filter(r => r.status === "absent").length / total) * 100,
      lateRate: (rows.filter(r => r.status === "late").length / total) * 100,
      overtimeHours: rows.reduce((sum, r) => sum + parseFloat(r.overtimeHours || "0"), 0),
      trend,
    });
  } catch (err) {
    req.log.error({ err }, "Error getting attendance stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
