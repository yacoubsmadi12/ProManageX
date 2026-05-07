import { Router } from "express";
import { db, contractsTable, contractorsTable } from "@workspace/db";
import { eq, lte, gte, and, sql } from "drizzle-orm";

const router = Router();

router.get("/contracts", async (req, res) => {
  try {
    const { status, contractorId, search } = req.query as Record<string, string>;
    const rows = await db
      .select({
        id: contractsTable.id,
        title: contractsTable.title,
        contractorId: contractsTable.contractorId,
        contractorName: contractorsTable.name,
        status: contractsTable.status,
        startDate: contractsTable.startDate,
        endDate: contractsTable.endDate,
        value: contractsTable.value,
        paidAmount: contractsTable.paidAmount,
        description: contractsTable.description,
        fileUrl: contractsTable.fileUrl,
        version: contractsTable.version,
        createdAt: contractsTable.createdAt,
        updatedAt: contractsTable.updatedAt,
      })
      .from(contractsTable)
      .leftJoin(contractorsTable, eq(contractsTable.contractorId, contractorsTable.id));
    let result = rows;
    if (status) result = result.filter(c => c.status === status);
    if (contractorId) result = result.filter(c => c.contractorId === parseInt(contractorId));
    if (search) result = result.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error listing contracts");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/contracts", async (req, res) => {
  try {
    const [contract] = await db.insert(contractsTable).values(req.body).returning();
    res.status(201).json(contract);
  } catch (err) {
    req.log.error({ err }, "Error creating contract");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/contracts/expiring-soon", async (req, res) => {
  try {
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const nowStr = now.toISOString().split("T")[0];
    const in30Str = in30Days.toISOString().split("T")[0];
    const rows = await db
      .select()
      .from(contractsTable)
      .where(and(gte(contractsTable.endDate, nowStr), lte(contractsTable.endDate, in30Str)));
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Error getting expiring contracts");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/contracts/stats", async (req, res) => {
  try {
    const all = await db.select().from(contractsTable);
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    res.json({
      total: all.length,
      active: all.filter(c => c.status === "active").length,
      expired: all.filter(c => c.status === "expired").length,
      draft: all.filter(c => c.status === "draft").length,
      totalValue: all.reduce((sum, c) => sum + parseFloat(c.value || "0"), 0),
      paidAmount: all.reduce((sum, c) => sum + parseFloat(c.paidAmount || "0"), 0),
      expiringThisMonth: all.filter(c => {
        const end = new Date(c.endDate);
        return end >= now && end <= in30Days;
      }).length,
    });
  } catch (err) {
    req.log.error({ err }, "Error getting contract stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/contracts/:id", async (req, res) => {
  try {
    const [contract] = await db.select().from(contractsTable).where(eq(contractsTable.id, parseInt(req.params.id)));
    if (!contract) return res.status(404).json({ error: "Contract not found" });
    res.json(contract);
  } catch (err) {
    req.log.error({ err }, "Error getting contract");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/contracts/:id", async (req, res) => {
  try {
    const [contract] = await db.update(contractsTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(contractsTable.id, parseInt(req.params.id)))
      .returning();
    if (!contract) return res.status(404).json({ error: "Contract not found" });
    res.json(contract);
  } catch (err) {
    req.log.error({ err }, "Error updating contract");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/contracts/:id", async (req, res) => {
  try {
    await db.delete(contractsTable).where(eq(contractsTable.id, parseInt(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting contract");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
