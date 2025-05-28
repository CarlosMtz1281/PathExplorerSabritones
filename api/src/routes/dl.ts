// File: dl.ts
import express from "express";
import dotenv from "dotenv";
import prisma from "../db/prisma";
import { getUserIdFromSession } from "../utils/session";

dotenv.config();

const router = express.Router();

router.get("/", async (req, res) => {
  console.log("DL base");
  res.json({ message: "DL base" });
});

// regresa los datos de los futuros proyectos y todas las postulaciones validas ordenadas por fecha de postulación
router.get("/dataFuturo", async (req, res) => {
  try {
    const userId = await getUserIdFromSession(req.headers["session-key"]);
    
    if (!userId || typeof userId !== "number") {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    // 1. Verificar si el usuario es un Delivery Lead
    const user = await prisma.users.findUnique({
      where: { user_id: userId },
      include: { 
        Permits: true
      }
    });

    if (!user?.Permits?.is_delivery_lead) {
      return res.status(403).json({ error: "User is not a Delivery Lead" });
    }

    // 2. Obtener los proyectos futuros donde el usuario es Delivery Lead
    const currentDate = new Date();
    const futureProjects = await prisma.projects.findMany({
      where: {
        delivery_lead_user_id: userId,
        start_date: {
          gt: currentDate // Proyectos que empiezan en el futuro
        }
      },
      include: {
        Country: {
          select: {
            country_name: true,
            region_name: true
          }
        }
      },
      orderBy: {
        start_date: 'asc' // Ordenar proyectos por fecha de inicio
      }
    });

    const projectIds = futureProjects.map(project => project.project_id);

    // 3. Obtener todas las posiciones de estos proyectos (tanto abiertas como ocupadas)
    const allPositions = await prisma.project_Positions.findMany({
    where: {
        project_id: { in: projectIds }
    },
    include: {
        Capability: {
        select: {
            capability_name: true
        }
        },
        Project_Position_Areas: {
        include: {
            Areas: true
        }
        },
        Users: { // Incluir información del usuario asignado
        select: {
            user_id: true,
            name: true,
            Employee_Position: {
            select: {
                level: true,
                Work_Position: {
                select: {
                    position_name: true
                }
                }
            },
            orderBy: {
                start_date: 'desc'
            },
            take: 1
            }
        }
        }
    }
    });

    // Separar en posiciones abiertas y ocupadas
    const openPositions = allPositions.filter(p => !p.user_id);
    const filledPositions = allPositions.filter(p => p.user_id);


    // 4. Obtener postulaciones válidas para estas posiciones con meetings
    const positionIds = openPositions.map(p => p.position_id);
    const validPostulations = await prisma.postulations.findMany({
      where: {
        project_position_id: { in: positionIds },
        valid: true
      },
      include: {
        Users: {
          select: {
            user_id: true,
            name: true,
            Employee_Position: {
              select: {
                level: true,
                Work_Position: {
                  select: {
                    position_name: true
                  }
                }
              },
              orderBy: {
                start_date: 'desc'
              },
              take: 1
            }
          }
        },
        Meeting: true,
        Project_Positions: {
          include: {
            Projects: {
              select: {
                project_name: true
              }
            },
            Capability: {
              select: {
                capability_name: true
              }
            }
          }
        }
      },
      orderBy: {
        postulation_date: 'asc' // Ordenar por fecha de postulación
      }
    });

    // 5. Formatear la respuesta
    const formattedProjects = futureProjects.map(project => ({
        projectId: project.project_id,
        projectName: project.project_name,
        companyName: project.company_name,
        description: project.project_desc,
        startDate: project.start_date,
        endDate: project.end_date,
        country: project.Country?.country_name,
        region: project.Country?.region_name,
        openPositions: openPositions
            .filter(p => p.project_id === project.project_id)
            .map(position => ({
            positionId: position.position_id,
            positionName: position.position_name,
            description: position.position_desc,
            capability: position.Capability?.capability_name,
            areas: position.Project_Position_Areas.map(area => ({
                areaId: area.Areas.area_id,
                areaName: area.Areas.area_name
            }))
            })),
        filledPositions: filledPositions // Añadir esta nueva propiedad
            .filter(p => p.project_id === project.project_id)
            .map(position => ({
            positionId: position.position_id,
            positionName: position.position_name,
            description: position.position_desc,
            capability: position.Capability?.capability_name,
            areas: position.Project_Position_Areas.map(area => ({
                areaId: area.Areas.area_id,
                areaName: area.Areas.area_name
            })),
            assignedUser: { // Información del usuario asignado
                userId: position.Users?.user_id,
                name: position.Users?.name,
                position: position.Users?.Employee_Position[0]?.Work_Position.position_name,
                level: position.Users?.Employee_Position[0]?.level
            }
            }))
    }));

    const formattedPostulations = validPostulations.map(postulation => ({
      postulationId: postulation.postulation_id,
      postulationDate: postulation.postulation_date,
      project: {
        projectId: postulation.Project_Positions.project_id,
        projectName: postulation.Project_Positions.Projects?.project_name
      },
      position: {
        positionId: postulation.Project_Positions.position_id,
        positionName: postulation.Project_Positions.position_name,
        capability: postulation.Project_Positions.Capability?.capability_name
      },
      user: {
        userId: postulation.Users?.user_id,
        name: postulation.Users?.name,
        position: postulation.Users?.Employee_Position[0]?.Work_Position.position_name,
        level: postulation.Users?.Employee_Position[0]?.level
      },
      meetings: postulation.Meeting.map(meeting => ({
        meetingId: meeting.meeting_id,
        meetingDate: meeting.meeting_date,
        meetingLink: meeting.meeting_link
      }))
    }));

    res.status(200).json({
      projects: formattedProjects,
      postulations: formattedPostulations
    });

  } catch (error) {
    console.error("Error in DL future projects endpoint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;