// File: employee.ts
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

router.post("/create", async (req, res) => {
  const {
    name,
    mail,
    password,
    birthday,
    country_id,
    experience,
    is_employee,
    is_people_lead,
    is_capability_lead,
    is_delivery_lead,
    is_admin
  } = req.body;

  if (!name || !mail || !password || !birthday || !country_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const encodedPassword = Buffer.from(password).toString("base64");

    // 🔍 Find or create a Permits entry that matches the flags
    const existingPermits = await prisma.permits.findFirst({
      where: {
        is_employee,
        is_people_lead,
        is_capability_lead,
        is_delivery_lead,
        is_admin,
      },
    });

    let role_id: number;

    if (existingPermits) {
      role_id = existingPermits.role_id;
    } else {
      const newPermits = await prisma.permits.create({
        data: {
          is_employee,
          is_people_lead,
          is_capability_lead,
          is_delivery_lead,
          is_admin,
        },
      });
      role_id = newPermits.role_id;
    }

    const user = await prisma.users.create({
      data: {
        name,
        mail,
        password: encodedPassword,
        birthday: new Date(birthday),
        hire_date: new Date(),
        country_id: parseInt(country_id),
        role_id,
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

    res.status(201).json({ message: "User created", user_id: user.user_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/checkstaff", async (req, res) => {
  try {
    const sessionKey = req.headers["session-key"];
    const userId = await getUserIdFromSession(sessionKey);

    if (!userId) {
      return res
        .status(400)
        .json({ error: "User ID is required in the headers." });
    }

    if (userId === "timeout") {
      return res.status(400).json({ error: "Timeout session" });
    }

    const today = new Date();

    const staff = await prisma.employee_Position.findMany({
      where: { user_id: userId },
      select: {
        user_id: true,
        end_date: true,
      },
    });

    if (!staff) {
      return res.status(404).json({ error: "User not found." });
    }

    const statuses = staff.map((position) => {
      if (!position.end_date) {
        return true;
      }
      const endDate = new Date(position.end_date);
      return endDate > today;
    });

    const isStaff = !statuses.some((status) => status === true);

    if (isStaff) {
      await prisma.users.update({
        where: { user_id: userId },
        data: {
          in_project: false,
        },
      });
    } else {
      await prisma.users.update({
        where: { user_id: userId },
        data: {
          in_project: true,
        },
      });
    }

    res
      .status(200)
      .json({ message: "Validation of staff member done successfully" });
  } catch (err) {
    console.error("Error fetching user data:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Usar esto con un CRON JOB y agregar ADMIN KEY header
router.patch("/checkstaffall", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const positions = await prisma.employee_Position.findMany({
      select: {
        user_id: true,
        end_date: true,
      },
    });

    const userStatusMap = new Map<number, boolean>();

    positions.forEach((position) => {
      const currentStatus = userStatusMap.get(position.user_id);
      if (currentStatus === true) return; // Already has a true status, keep it

      const endDate = position.end_date ? new Date(position.end_date) : null;
      const isValid = !endDate || endDate > today;

      userStatusMap.set(position.user_id, isValid);
    });

    const allUsers = Array.from(userStatusMap, ([user_id, in_project]) => ({
      user_id,
      in_project,
    }));

    const usersInProjects = allUsers.filter((u) => u.in_project);
    const usersNotInProjects = allUsers.filter((u) => !u.in_project);

    console.log("Users in projects:", usersInProjects);
    console.log("Users not in projects:", usersNotInProjects);

    const updateInProject = await prisma.users.updateMany({
      where: { user_id: { in: usersInProjects.map((u) => u.user_id) } },
      data: { in_project: true },
    });

    const updateNotInProject = await prisma.users.updateMany({
      where: { user_id: { in: usersNotInProjects.map((u) => u.user_id) } },
      data: { in_project: false },
    });

    res.status(200).json({
      message: `Updated ${updateInProject.count} in projects, ${updateNotInProject.count} out of projects`,
    });
  } catch (err) {
    console.error("Error updating staff statuses:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// In your employee.ts route
// In your employee.ts route
router.get("/experience", async (req, res) => {
  try {
    const userId = await getUserIdFromSession(req.headers["session-key"]);

    // Fetch jobs with their work positions
    const workPositions = await prisma.employee_Position.findMany({
      where: { user_id: Number(userId) },
      include: {
        Work_Position: true,
      },
      orderBy: { start_date: "asc" },
    });

    // Fetch projects with all necessary relations
    const userProjects = await prisma.project_User.findMany({
      where: { user_id: Number(userId) },
      include: {
        Projects: {
          include: {
            Country: true,
            Users: true, // Delivery lead
            Project_Positions: {
              where: { user_id: Number(userId) },
              include: {
                Project_Position_Skills: {
                  include: {
                    Skills: true,
                  },
                },
              },
            },
            Feedback: {
              where: { user_id: Number(userId) },
            },
          },
        },
      },
    });
    // Format dates consistently
    const formatDate = (date: Date | null) =>
      date ? new Date(date).toLocaleDateString("es-ES") : "Current";

    const jobs = workPositions.map((pos) => ({
      company: pos.Work_Position.company || "Unknown",
      position: pos.Work_Position.position_name || "Unknown",
      startDate: formatDate(pos.start_date),
      endDate: formatDate(pos.end_date),
      rawStart: pos.start_date,
      rawEnd: pos.end_date,
    }));

    const projects = userProjects.map((proj) => {
      const position = proj.Projects.Project_Positions[0]; // Get John's position in this project
      const feedback = proj.Projects.Feedback[0]; // Get feedback for John in this project

      return {
        projectName: proj.Projects.project_name || "Unknown",
        company: proj.Projects.company_name || "Unknown",
        positionName: position?.position_name || "No position assigned",
        projectDescription: proj.Projects.project_desc || "No description",
        startDate: formatDate(proj.Projects.start_date),
        endDate: formatDate(proj.Projects.end_date),
        feedbackDesc: feedback?.desc || "No feedback",
        feedbackScore: feedback?.score || null,
        deliveryLeadName: proj.Projects.Users?.name || "Unknown Lead",
        skills:
          position?.Project_Position_Skills.map((s) => s.Skills.name) || [],
        rawStart: proj.Projects.start_date,
        rawEnd: proj.Projects.end_date,
      };
    });

    res.status(200).json({ jobs, projects });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
export default router;
