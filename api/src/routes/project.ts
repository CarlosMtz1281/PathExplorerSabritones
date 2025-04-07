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

router.post("/create", async (req, res) => {
  const { project_name, desc, start_date, end_date, region_id, positions } = req.body;

  try {
    // Create the project
    const project = await prisma.projects.create({
      data: {
        project_id: undefined, // Ensure Prisma auto-generates this field
        project_name,
        project_desc: desc,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        Region: { connect: { region_id: Number(region_id) } },
      },
    });

    // Create positions, skills, and certifications
    for (const position of positions) {
      const createdPosition = await prisma.project_Positions.create({
        data: {
          position_id: undefined, // Ensure Prisma auto-generates this field
          position_name: position.name,
          position_desc: position.desc,
          Projects: { connect: { project_id: project.project_id } },
        },
      });

      // Add skills to the position
      for (const skill_id of position.skills) {
        await prisma.project_Position_Skills.create({
          data: {
            position_id: createdPosition.position_id,
            skill_id,
          },
        });
      }

      // Add certifications to the position
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
