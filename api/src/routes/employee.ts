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

router.get("/getsSkillsId/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

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

// File: src/routes/user.ts or wherever your user routes are defined

router.get("/getCapabilityTeamMembers/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);

  if (isNaN(userId)) {
    return res.status(400).json({ error: "Invalid project ID" });
  }
  try {
    // Get the user's capability information
    const user = await prisma.users.findUnique({
      where: { user_id: userId },
      include: {
        Capability_Employee_Capability_Employee_employee_idToUsers: {
          include: {
            Capability: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Extract capability ID from user data
    let capabilityId = null;

    if (
      user.Capability_Employee_Capability_Employee_employee_idToUsers.length > 0
    ) {
      capabilityId =
        user.Capability_Employee_Capability_Employee_employee_idToUsers[0]
          .capability_id;
    }

    if (!capabilityId) {
      return res.status(200).json([]); // User doesn't belong to any capability
    }

    // Get all team members in this capability
    const capabilityMembers = await prisma.capability_Employee.findMany({
      where: { capability_id: capabilityId },
      include: {
        Users_Capability_Employee_employee_idToUsers: {
          select: {
            user_id: true,
            name: true,
            mail: true,
            Employee_Position: {
              include: {
                Work_Position: true,
              },
              orderBy: {
                start_date: "desc",
              },
              take: 1, // Get only the most recent position
            },
          },
        },
      },
    });

    // Format the response
    const teamMembers = capabilityMembers.map((member) => ({
      user_id: member.Users_Capability_Employee_employee_idToUsers.user_id,
      name:
        member.Users_Capability_Employee_employee_idToUsers.name || "Unknown",
      mail: member.Users_Capability_Employee_employee_idToUsers.mail || "",
      position:
        member.Users_Capability_Employee_employee_idToUsers.Employee_Position[0]
          ?.Work_Position?.position_name || null,
    }));

    res.status(200).json(teamMembers);
  } catch (error) {
    console.error("Error fetching capability team members:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
