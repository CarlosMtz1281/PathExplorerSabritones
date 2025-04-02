// File: user.js
import express from "express";
import dotenv from "dotenv";
import prisma from "../db/prisma";
import getCargabilidad from "../utils/cargabilidad";
import { updateSession, getUserIdFromSession } from "../utils/session";
dotenv.config();

const router = express.Router();

// Get all users
router.get("/users", async (req, res) => {
  const users = await prisma.users.findMany();
  res.json(users);
});

// Validate user login and returns sessionId
router.post("/login", async (req, res) => {
  const { mail, password } = req.body;
  if (!mail || !password) {
    return res.status(400).json({ error: "Invalid or missing mail or password" });
  }

  const user = await prisma.users.findFirst({
    where: { mail },
  });  

  if (user && user.password === password) {
    // generate session for this user and return session id
    const newSession = await prisma.session.create({
      data: {
        user_id: user.user_id
      },
    });

    // Return session ID
    res.json({
      success: true,
      sessionId: newSession.session_id
    });
  } else {
    res.json({ success: false });
  }
});

router.get("/cargabilidad", async (req, res) => {
  const session_id = req.query.session_id;

  console.log("session_id:", session_id);

  const userId = await getUserIdFromSession(session_id);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (isNaN(userId)) {
    return res.status(400).json({ error: "Invalid or missing userId" });
  }

  try {
    const result = await getCargabilidad(userId);
    if (!result) {
      return res.status(404).json({ message: "No data found for user" });
    }

    await updateSession(session_id);

    res.json(result);
  } catch (error) {
    console.error("Error getting cargabilidad:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
