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
        Country: true,
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
        .json({ error: "Session key is required in the headers." });
    }

    if (typeof userId !== "number") {
      return res.status(400).json({ error: "Timeout session" });
    }

    const skills = await prisma.user_Skills.findMany({
      where: { user_id: userId },
      include: {
        Skills: true,
      },
    });

    const formattedSkills = skills.map((skill) => ({
      skill_id: skill.skill_id,
      skill_name: skill.Skills.name,
      skill_technical: skill.Skills.technical,
    }));

    res.status(200).json(formattedSkills);
  } catch (error) {
    console.error("Error fetching user skills:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/skills", async (req, res) => {
  try {
    const { skills } = req.body;

    const userId = await getUserIdFromSession(req.headers["session-key"]);

    if (typeof userId !== "number") {
      return res.status(400).json({ error: "Timeout session" });
    }

    if (!userId) {
      return res
        .status(400)
        .json({ error: "Session key is required in the headers." });
    }

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

router.post('/create', async (req, res) => {
  const {
    name,
    mail,
    password,
    birthday,
    hire_date,
    role_id,
    country_id,
    experience,
  } = req.body;

  if (!name || !mail || !password || !birthday || !hire_date || !country_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const user = await prisma.users.create({
      data: {
        name,
        mail,
        password,
        birthday: new Date(birthday),
        hire_date: new Date(hire_date),
        country_id: parseInt(country_id),
        role_id: role_id ? parseInt(role_id) : undefined,
        in_project: false,
      },
    });

    for (const exp of experience || []) {
      const position = await prisma.work_Position.create({
        data: {
          position_name: exp.position_name,
          position_desc: exp.position_desc,
          company: exp.company,
        },
      });

      await prisma.employee_Position.create({
        data: {
          user_id: user.user_id,
          position_id: position.position_id,
          start_date: new Date(exp.start_date),
          end_date: new Date(exp.end_date),
        },
      });
    }

    res.status(201).json({ message: 'User created', user_id: user.user_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
