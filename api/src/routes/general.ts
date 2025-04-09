// File: user.js
import express from "express";
import { Request, Response } from "express";
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
    return res
      .status(400)
      .json({ error: "Invalid or missing mail or password" });
  }

  const user = await prisma.users.findFirst({
    where: { mail },
  });

  if (user && user.password === password) {
    // generate session for this user and return session id
    const newSession = await prisma.session.create({
      data: {
        user_id: user.user_id,
      },
    });

    // Return session ID
    res.json({
      success: true,
      sessionId: newSession.session_id,
      userId: user.user_id,
      name: user.name,
      region_id: user.region_id,
      in_project: user.in_project,
    });
  } else {
    res.json({ success: false });
  }
});

router.get("/cargabilidad", async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const result = await getCargabilidad(userId);
    if (!result) {
      return res.status(404).json({ message: "No data found for user" });
    }

    res.json(result);
  } catch (error) {
    console.error("Error getting cargabilidad:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/getMe", async (req: Request, res: Response) => {
  try {
    // Get the session ID from the cookies
    const user_id = req.cookies?.sessionId.user_id;
    console.log("sessionId:", user_id);

    if (!user_id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: No session ID provided" });
    }

    // Find the user associated with the session
    const user = await prisma.users.findUnique({
      where: { user_id: user_id },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return the user data
    res.status(200).json({
      id: user.user_id,
      mail: user.mail,
      region_id: user.region_id,
      name: user.name,
      in_project: user.in_project,
    });
  } catch (error: any) {
    console.error("Error in getMe controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all existent skills in database
router.get("/skills", async (req, res) => {
  try {
    const skills = await prisma.skills.findMany({
      select: {
        skill_id: true,
        name: true,
        technical: true,
      },
    });

    res.status(200).json(skills);
  } catch (error) {
    console.error("Error fetching skills:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
