// File: poject.js
import express from "express";
import dotenv from "dotenv";
import prisma from "../db/prisma";

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
        Region: true,
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
        region: project.Region.region_name,
        capability: project.Users.name,
      },
    }));

    res.json(formattedProjects);
  } catch (error) {
    console.error("Error fetching available projects:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/repositories/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const project = await prisma.projects.findUnique({
      where: { project_id: Number(id) },
      include: {
        Project_Positions: {
          include: {
            Project_Position_Skills: {
              include: {
                Skills: true,
              },
            },
            Project_Position_Certificates: {
              include: {
                Certificates: true,
              },
            },
            Postulations: {
              include: {
                Users: true,
                Meeting: true,
              },
            },
            Users: true,
          },
        },
        Region: true,
        Users: true,
        Project_User: {
          include: {
            Users: true,
          },
        },
        Feedback: {
          include: {
            Users: true,
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const formattedProject = {
      id: project.project_id,
      name: project.project_name,
      description: project.project_desc,
      company: project.company_name,
      start_date: project.start_date.toLocaleDateString("es-ES"),
      end_date: project.end_date
        ? project.end_date.toLocaleDateString("es-ES")
        : null,
      region: project.Region,
      delivery_lead: project.Users,
      positions: project.Project_Positions,
      team_members: project.Project_User,
      feedback: project.Feedback,
    };

    res.json(formattedProject);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
export default router;
