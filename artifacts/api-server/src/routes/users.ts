import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, like, or, sql } from "drizzle-orm";

const router = Router();

router.get("/users", async (req, res) => {
  try {
    const { role, search, status } = req.query as Record<string, string>;
    let query = db.select().from(usersTable);
    const conditions = [];
    if (role) conditions.push(eq(usersTable.role, role));
    if (status) conditions.push(eq(usersTable.status, status));
    if (search) {
      conditions.push(
        or(
          like(usersTable.firstName, `%${search}%`),
          like(usersTable.lastName, `%${search}%`),
          like(usersTable.email, `%${search}%`),
        )!
      );
    }
    const where = conditions.length > 0 ? conditions[0] : undefined;
    const users = conditions.length > 0
      ? await db.select().from(usersTable).where(where)
      : await db.select().from(usersTable);
    res.json(users);
  } catch (err) {
    req.log.error({ err }, "Error listing users");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/users", async (req, res) => {
  try {
    const [user] = await db.insert(usersTable).values({
      id: crypto.randomUUID(),
      ...req.body,
    }).returning();
    res.status(201).json(user);
  } catch (err) {
    req.log.error({ err }, "Error creating user");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/users/:id", async (req, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.params.id));
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    req.log.error({ err }, "Error getting user");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/users/:id", async (req, res) => {
  try {
    const [user] = await db.update(usersTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(usersTable.id, req.params.id))
      .returning();
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    req.log.error({ err }, "Error updating user");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    await db.delete(usersTable).where(eq(usersTable.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting user");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
