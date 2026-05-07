import { Router } from "express";
import { db, usersTable, contractorsTable, contractsTable, attendanceTable, violationsTable, equipmentTable, workAreasTable, notificationsTable, auditLogsTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";

const router = Router();

router.get("/dashboard/summary", async (req, res) => {
  try {
    const [users, contractors, contracts, violations, equipment, workAreas, notifications] = await Promise.all([
      db.select().from(usersTable),
      db.select().from(contractorsTable),
      db.select().from(contractsTable),
      db.select().from(violationsTable),
      db.select().from(equipmentTable),
      db.select().from(workAreasTable),
      db.select().from(notificationsTable),
    ]);
    const today = new Date().toISOString().split("T")[0];
    const attendance = await db.select().from(attendanceTable).where(eq(attendanceTable.date, today));
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringContracts = contracts.filter(c => {
      const end = new Date(c.endDate);
      return end >= now && end <= in30Days;
    });
    res.json({
      totalUsers: users.length,
      totalContractors: contractors.length,
      activeContracts: contracts.filter(c => c.status === "active").length,
      contractValue: contracts.filter(c => c.status === "active").reduce((sum, c) => sum + parseFloat(c.value || "0"), 0),
      presentToday: attendance.filter(a => a.status === "present").length,
      openViolations: violations.filter(v => v.status === "open").length,
      equipmentTotal: equipment.length,
      workAreas: workAreas.length,
      expiringContracts: expiringContracts.length,
      unreadNotifications: notifications.filter(n => !n.read).length,
    });
  } catch (err) {
    req.log.error({ err }, "Error getting dashboard summary");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/activity", async (req, res) => {
  try {
    const rows = await db.select().from(auditLogsTable).orderBy(desc(auditLogsTable.createdAt)).limit(20);
    res.json(rows.map(r => ({
      id: r.id,
      type: r.entity,
      description: r.details || `${r.action} on ${r.entity}`,
      userId: r.userId,
      userName: null,
      createdAt: r.createdAt,
    })));
  } catch (err) {
    req.log.error({ err }, "Error getting activity");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/attendance-trend", async (req, res) => {
  try {
    const rows = await db.select().from(attendanceTable);
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayRows = rows.filter(r => r.date === dateStr);
      trend.push({
        label: d.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" }),
        value: dayRows.filter(r => r.status === "present").length,
        secondaryValue: dayRows.filter(r => r.status === "absent").length,
      });
    }
    res.json(trend);
  } catch (err) {
    req.log.error({ err }, "Error getting attendance trend");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/contractor-performance", async (req, res) => {
  try {
    const contractors = await db.select().from(contractorsTable).limit(10);
    const contracts = await db.select().from(contractsTable);
    const violations = await db.select().from(violationsTable);
    const result = contractors.map(c => ({
      contractorId: c.id,
      contractorName: c.companyName,
      score: parseFloat(c.performanceScore || "75"),
      contracts: contracts.filter(ct => ct.contractorId === c.id).length,
      violations: 0,
    }));
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error getting contractor performance");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
