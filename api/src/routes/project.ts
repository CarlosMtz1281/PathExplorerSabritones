// File: project.js
import express from "express";
import dotenv from "dotenv";
import prisma from "../db/prisma";
import { updateSession, getUserIdFromSession } from "../utils/session";

dotenv.config();

const router = express.Router();

router.get("/", async (req, res) => {
  console.log("Projects base");
  res.json({ message: "Projects base" });
});

router.get("/repositories", async (req, res) => {
  try {
    const currentDate = new Date();
    const availableProjects = await prisma.projects.findMany({
      where: {
        AND: [
          { start_date: { gt: currentDate } },
          {
            Project_Positions: {
              some: {
                user_id: null,
              },
            },
          },
        ],
      },
      include: {
        Project_Positions: {
          where: {
            user_id: null,
          },
        },
        Country: true, // Changed from Region
        Users: true,
      },
    });

    const formattedProjects = availableProjects.map((project) => ({
      id: project.project_id,
      name: project.project_name,
      start_date: project.start_date.toLocaleDateString("es-ES"),
      end_date: project.end_date.toLocaleDateString("es-ES"),
      vacants: project.Project_Positions.length,
      details: {
        company: project.company_name,
        country: project.Country?.country_name || "No country", // Changed from Region
        capability: project.Users.name,
      },
    }));

    res.status(200).json(formattedProjects);
  } catch (error) {
    console.error("Error fetching available projects:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/getProjectById/:projectId", async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);

    if (isNaN(projectId)) {
      return res.status(400).json({ error: "Invalid project ID" });
    }

    const project = await prisma.projects.findUnique({
      where: {
        project_id: projectId,
      },
      include: {
        Project_Positions: true,
        Country: true,
        Users: true,
      },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const formattedProject = {
      id: project.project_id,
      name: project.project_name,
      start_date: project.start_date.toLocaleDateString("es-ES"),
      end_date: project.end_date.toLocaleDateString("es-ES"),
      vacants: project.Project_Positions.length,
      details: {
        company: project.company_name,
        country: project.Country?.country_name || "No country",
        capability: project.Users.name,
      },
      positions: project.Project_Positions,
    };

    res.status(200).json(formattedProject);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/create", async (req, res) => {
  const {
    project_name,
    company_name,
    desc,
    start_date,
    end_date,
    country_id,
    positions,
  } = req.body;
  const sessionId = req.headers.authorization;
  console.log("Session ID:", sessionId);

  if (!sessionId) {
    console.log("Session ID not provided");
    return res.status(401).json({ error: "Session ID required" });
  }

  try {
    const delivery_lead_user_id = await getUserIdFromSession(sessionId);
    console.log("User ID from session:", delivery_lead_user_id);

    if (!delivery_lead_user_id) {
      console.log("Invalid session");
      return res.status(401).json({ error: "Invalid session" });
    }

    // Verify user exists
    const user = await prisma.users.findUnique({
      where: { user_id: Number(delivery_lead_user_id) },
    });

    if (!user) {
      console.log("User not found");
      return res.status(404).json({ error: "User not found" });
    }

    const project = await prisma.projects.create({
      data: {
        project_name,
        delivery_lead_user_id: Number(delivery_lead_user_id),
        company_name,
        country_id,
        project_desc: desc,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
      },
    });

    for (const position of positions) {
      const createdPosition = await prisma.project_Positions.create({
        data: {
          position_name: position.name,
          position_desc: position.desc,
          project_id: project.project_id,
        },
      });

      for (const skill_id of position.skills) {
        await prisma.project_Position_Skills.create({
          data: {
            position_id: createdPosition.position_id,
            skill_id,
          },
        });
      }

      for (const certificate_id of position.certifications) {
        await prisma.project_Position_Certificates.create({
          data: {
            position_id: createdPosition.position_id,
            certificate_id,
          },
        });
      }
    }

    res.status(201).json({ message: "Project created successfully", project });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
