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
  try {
    const { mail, password } = req.body;
    if (!mail || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    const user = await prisma.users.findFirst({
      where: { mail },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Verify the hashed password
    const passwordMatch = await prisma.$queryRaw`
      SELECT (password = crypt(${password}, password)) AS match
      FROM "Users"
      WHERE mail = ${mail}
    `;

    if (!passwordMatch[0]?.match) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Create a new session
    const newSession = await prisma.session.create({
      data: {
        user_id: user.user_id,
      },
    });

    // Return success response
    return res.json({
      success: true,
      sessionId: newSession.session_id,
      userId: user.user_id,
      name: user.name,
      country_id: user.country_id, // Changed from region_id to country_id to match your schema
      in_project: user.in_project,
      role_id: user.role_id, // Added role_id which might be useful for frontend
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
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
      country_id: user.country_id,
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

    const formattedSkills = skills.map((skill) => ({
      skill_id: skill.skill_id,
      skill_name: skill.name,
      skill_technical: skill.technical,
    }));

    res.status(200).json(formattedSkills);
  } catch (error) {
    console.error("Error fetching skills:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
