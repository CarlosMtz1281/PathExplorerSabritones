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

router.get("/userID", async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromSession(req.headers["session-key"]);

    res.status(200).json({ user_id: userId });
  } catch (error: any) {
    console.error("Error in /getMe:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
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

    //console.log(result);
    if (!result) {
      return res.json(0);
    }

    return res.json(result);
  } catch (error) {
    console.error("Error getting cargabilidad:", error);
    return res.status(500).json({ error: "Internal server error" });
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

router.get("/countries", async (req, res) => {
  try {
    const countries = await prisma.country.findMany({
      select: {
        country_id: true,
        country_name: true,
      },
    });

    res.status(200).json(countries);
  } catch (error) {
    console.error("Error fetching countries:", error);
    res.status(500).json({ error: "Failed to fetch countries" });
  }
});

router.get("/certificates", async (req, res) => {
  try {
    const certificates = await prisma.certificates.findMany({
      select: {
        certificate_id: true,
        certificate_name: true,
        certificate_desc: true,
        provider: true,
      },
    });

    res.status(200).json(certificates);
  } catch (error) {
    console.error("Error fetching skills:", error);
    res.status(500).json({ error: "Failed to fetch skills" });
  }
});

router.get("/capabilities", async (req, res) => {
  try {
    const capabilities = await prisma.capability.findMany({
      select: {
        capability_id: true,
        capability_name: true,
      },
    });

    res.status(200).json(capabilities);
  } catch (error) {
    console.error("Error fetching capabilities:", error);
    res.status(500).json({ error: "Failed to fetch capabilities" });
  }
});

router.get("/roles", async (req, res) => {
  try {
    const roles = await prisma.permits.findMany();

    const readableRoles = roles.map((role) => {
      const labels = [];

      if (role.is_admin) labels.push("Admin");
      if (role.is_delivery_lead) labels.push("Delivery Lead");
      if (role.is_capability_lead) labels.push("Capability Lead");
      if (role.is_people_lead) labels.push("People Lead");
      if (role.is_employee) labels.push("Empleado");

      return {
        role_id: role.role_id,
        role_name: labels.join(", ") || "Sin rol definido",
      };
    });

    res.status(200).json(readableRoles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ error: "Failed to fetch roles" });
  }
});

// Get skills related to a specific certificate
router.get("/certificates/:certificateId/skills", async (req, res) => {
  const { certificateId } = req.params;

  try {
    const skills = await prisma.certificate_Skills.findMany({
      where: { certificate_id: Number(certificateId) },
      include: {
        Skills: true,
      },
    });

    const formattedSkills = skills.map((skill) => ({
      skill_id: skill.skill_id,
      skill_name: skill.Skills.name,
    }));

    res.status(200).json(formattedSkills);
  } catch (error) {
    console.error("Error fetching skills:", error);
    res.status(500).json({ error: "Failed to fetch skills" });
  }
});

export default router;
