import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { readDb, writeDb } from "../../database/database.js";

const JWT_SECRET = "secret";

export default {
  async register({ username, password, profilePicture }) {
    // Load DB
    const db = await readDb();

    // Check for existing username
    const existing = db.users.find((u) => u.username === username);
    if (existing) {
      const err = new Error("Username already taken");
      err.statusCode = 400;
      throw err;
    }

    // Create new user
    const user = {
      id: crypto.randomUUID(),
      username,
      password,
      profilePicture: profilePicture || "",
    };

    // Save user
    db.users.push(user);
    await writeDb(db);

    // Return user without password
    return {
      id: user.id,
      username: user.username,
      profilePicture: user.profilePicture,
    };
  },

  async login({ username, password }) {
    // Load DB
    const db = await readDb();

    // Find matching user
    const user = db.users.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      const err = new Error("Invalid username or password");
      err.statusCode = 401;
      throw err;
    }

    // Create token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Return token + safe user info
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        profilePicture: user.profilePicture,
      },
    };
  },
};
