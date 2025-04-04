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
      start_date: project.start_date,
      end_date: project.end_date,
      vacants: project.Project_Positions.length,
      region: project.Region.region_name,
      capability: project.Users.name,
    }));

    res.json(formattedProjects);
  } catch (error) {
    console.error("Error fetching available projects:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
