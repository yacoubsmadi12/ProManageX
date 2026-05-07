import { Router } from "express";
import { db, evaluationsTable, usersTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";

const router = Router();

router.get("/evaluations", async (req, res) => {
  try {
    const { userId, period } = req.query as Record<string, string>;
    let rows = await db
      .select({
        id: evaluationsTable.id,
        userId: evaluationsTable.userId,
        userName: sql<string>`${usersTable.firstName} || ' ' || ${usersTable.lastName}`,
        evaluatorId: evaluationsTable.evaluatorId,
        period: evaluationsTable.period,
        kpiScore: evaluationsTable.kpiScore,
        attendanceScore: evaluationsTable.attendanceScore,
        qualityScore: evaluationsTable.qualityScore,
        punctualityScore: evaluationsTable.punctualityScore,
        overallScore: evaluationsTable.overallScore,
        status: evaluationsTable.status,
        comments: evaluationsTable.comments,
        createdAt: evaluationsTable.createdAt,
      })
      .from(evaluationsTable)
      .leftJoin(usersTable, eq(evaluationsTable.userId, usersTable.id));
    if (userId) rows = rows.filter(r => r.userId === userId);
    if (period) rows = rows.filter(r => r.period === period);
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Error listing evaluations");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/evaluations", async (req, res) => {
  try {
    const [evaluation] = await db.insert(evaluationsTable).values(req.body).returning();
    res.status(201).json(evaluation);
  } catch (err) {
    req.log.error({ err }, "Error creating evaluation");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/evaluations/rankings", async (req, res) => {
  try {
    const rows = await db
      .select({
        userId: evaluationsTable.userId,
        userName: sql<string>`${usersTable.firstName} || ' ' || ${usersTable.lastName}`,
        profileImageUrl: usersTable.profileImageUrl,
        overallScore: evaluationsTable.overallScore,
      })
      .from(evaluationsTable)
      .leftJoin(usersTable, eq(evaluationsTable.userId, usersTable.id));
    const grouped: Record<string, { userId: string; userName: string; profileImageUrl: string | null; scores: number[] }> = {};
    for (const r of rows) {
      if (!grouped[r.userId]) grouped[r.userId] = { userId: r.userId, userName: r.userName, profileImageUrl: r.profileImageUrl, scores: [] };
      grouped[r.userId].scores.push(parseFloat(r.overallScore || "0"));
    }
    const rankings = Object.values(grouped)
      .map((g, i) => ({
        userId: g.userId as unknown as number,
        userName: g.userName,
        profileImageUrl: g.profileImageUrl,
        averageScore: g.scores.reduce((a, b) => a + b, 0) / (g.scores.length || 1),
        rank: i + 1,
        trend: "stable",
      }))
      .sort((a, b) => b.averageScore - a.averageScore)
      .map((r, i) => ({ ...r, rank: i + 1 }));
    res.json(rankings);
  } catch (err) {
    req.log.error({ err }, "Error getting rankings");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/evaluations/kpi-dashboard", async (req, res) => {
  try {
    const rows = await db.select().from(evaluationsTable);
    const avg = rows.length > 0 ? rows.reduce((sum, r) => sum + parseFloat(r.overallScore || "0"), 0) / rows.length : 0;
    res.json({
      averageKpi: avg,
      topPerformers: rows.filter(r => parseFloat(r.overallScore || "0") >= 80).length,
      totalEvaluations: rows.length,
      pendingEvaluations: rows.filter(r => r.status === "draft").length,
      byDepartment: [],
    });
  } catch (err) {
    req.log.error({ err }, "Error getting kpi dashboard");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/evaluations/:id", async (req, res) => {
  try {
    const [evaluation] = await db.select().from(evaluationsTable).where(eq(evaluationsTable.id, parseInt(req.params.id)));
    if (!evaluation) return res.status(404).json({ error: "Evaluation not found" });
    res.json(evaluation);
  } catch (err) {
    req.log.error({ err }, "Error getting evaluation");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/evaluations/:id", async (req, res) => {
  try {
    const [evaluation] = await db.update(evaluationsTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(evaluationsTable.id, parseInt(req.params.id)))
      .returning();
    if (!evaluation) return res.status(404).json({ error: "Evaluation not found" });
    res.json(evaluation);
  } catch (err) {
    req.log.error({ err }, "Error updating evaluation");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
