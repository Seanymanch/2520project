import { readDb, writeDb } from "../../database/database.js";
import crypto from "node:crypto";

export default {
  async findAll() {
    // Load DB
    const db = await readDb();

    // Return all tips
    return db.tips;
  },

  async create({ title, userId }) {
    // Load DB
    const db = await readDb();

    // Build new tip
    const tip = {
      id: crypto.randomUUID(),
      title,
      userId,
    };

    // Save to database
    db.tips.push(tip);
    await writeDb(db);

    // Return only the id
    return tip.id;
  },

  async update({ id, title, userId }) {
    // Load DB
    const db = await readDb();

    // Find matching tip for this user
    const tip = db.tips.find(
      (t) => t.id === id && t.userId === userId
    );

    if (!tip) {
      return false;
    }

    // Update title
    tip.title = title;

    // Save changes
    await writeDb(db);
    return true;
  },

  async remove({ id, userId }) {
    // Load DB
    const db = await readDb();

    // Find index of tip that belongs to this user
    const index = db.tips.findIndex(
      (t) => t.id === id && t.userId === userId
    );

    if (index === -1) {
      return false;
    }

    // Remove it
    db.tips.splice(index, 1);

    // Save updated DB
    await writeDb(db);
    return true;
  },
};
