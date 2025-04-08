import express from "express";
import dotenv from "dotenv";
import prisma from "../db/prisma";
import { getUserIdFromSession } from "../utils/session";

dotenv.config();

const router = express.Router();

router.get("/", async (req, res) => {
  console.log("Employee base");
  res.json({ message: "Employee base" });
});

router.get("/user", async (req, res) => {
  try {
    const userId = parseInt(req.headers["user-id"], 10);

    if (!userId) {
      return res
        .status(400)
        .json({ error: "User ID is required in the headers." });
    }

    const user = await prisma.users.findUnique({
      where: { user_id: userId },
      include: {
        Region: true,
        Permits: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.get("/skills", async (req, res) => {
  try {
    const userId = await getUserIdFromSession(req.headers["session-key"]);

    if (!userId) {
      return res
        .status(400)
        .json({ error: "User ID is required in the headers." });
    }

    const skills = await prisma.user_Skills.findMany({
      where: { user_id: userId },
      include: {
        Skills: true,
      },
    });

    res.json(skills);
  } catch (error) {
    console.error("Error fetching user skills:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/skills", async (req, res) => {
  try {
    const { skills } = req.body;

    const userId = await getUserIdFromSession(req.headers["session-key"]);

    if (skills.length === 0) {
      return res.status(400).json({ error: "Skills are required." });
    }

    skills.forEach(async (skill) => {
      await prisma.user_Skills.create({
        data: {
          user_id: userId,
          skill_id: skill,
        },
      });
    });

    res.status(200).json({ message: "Skills added successfully." });
  } catch (error) {
    console.error("Error adding user skills:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
