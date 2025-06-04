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
                },
                // Incluir skills del usuario
                User_Skills: {
                include: {
                    Skills: true
                }
                },
                // Incluir certificados del usuario
                Certificate_Users: {
                include: {
                    Certificates: true
                }
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
                },
                // Incluir skills requeridos por el puesto
                Project_Position_Skills: {
                include: {
                    Skills: true
                }
                },
                // Incluir certificados requeridos por el puesto
                Project_Position_Certificates: {
                include: {
                    Certificates: true
                }
                }
            }
            }
        },
        orderBy: {
            postulation_date: 'asc'
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
            capability: postulation.Project_Positions.Capability?.capability_name,
            // Skills requeridos por el puesto
            requiredSkills: postulation.Project_Positions.Project_Position_Skills.map(skill => ({
            skillId: skill.Skills.skill_id,
            skillName: skill.Skills.name
            })),
            // Certificados requeridos por el puesto
            requiredCertificates: postulation.Project_Positions.Project_Position_Certificates.map(cert => ({
            certificateId: cert.Certificates.certificate_id,
            certificateName: cert.Certificates.certificate_name
            }))
        },
        user: {
            userId: postulation.Users?.user_id,
            name: postulation.Users?.name,
            position: postulation.Users?.Employee_Position[0]?.Work_Position.position_name,
            level: postulation.Users?.Employee_Position[0]?.level,
            // Skills del usuario
            userSkills: postulation.Users?.User_Skills.map(skill => ({
            skillId: skill.Skills.skill_id,
            skillName: skill.Skills.name
            })) || [],
            // Certificados del usuario
            userCertificates: postulation.Users?.Certificate_Users.map(cert => ({
            certificateId: cert.Certificates.certificate_id,
            certificateName: cert.Certificates.certificate_name
            })) || []
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

// Agendar una nueva reunión
router.post("/scheduleMeeting", async (req, res) => {
  try {
    const userId = await getUserIdFromSession(req.headers["session-key"]);
    
    if (!userId || typeof userId !== "number") {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    // Verificar que el usuario es Delivery Lead
    const user = await prisma.users.findUnique({
      where: { user_id: userId },
      include: { Permits: true }
    });

    if (!user?.Permits?.is_delivery_lead) {
      return res.status(403).json({ error: "User is not a Delivery Lead" });
    }

    // Validar los datos de entrada
    const { postulationId, meetingDate, meetingTime, meetingLink } = req.body;

    if (!postulationId || !meetingDate || !meetingTime) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Verificar que la postulación existe y pertenece a un proyecto del DL
    const postulation = await prisma.postulations.findUnique({
      where: { postulation_id: postulationId },
      include: {
        Project_Positions: {
          include: {
            Projects: true
          }
        }
      }
    });

    if (!postulation) {
      return res.status(404).json({ error: "Postulation not found" });
    }

    // Verificar que el DL es el líder del proyecto
    const project = await prisma.projects.findUnique({
      where: { project_id: postulation.Project_Positions?.project_id }
    });

    if (project?.delivery_lead_user_id !== userId) {
      return res.status(403).json({ error: "Not authorized to schedule meetings for this project" });
    }

    // Crear objeto de fecha combinando meetingDate y meetingTime
    const combinedDate = new Date(meetingDate);
    const [hours, minutes] = meetingTime.split(':');
    combinedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Crear la reunión en la base de datos
    const newMeeting = await prisma.meeting.create({
      data: {
        meeting_date: combinedDate,
        meeting_link: meetingLink,
        postulation_id: postulationId
      }
    });

    // response data tiene que ser success
    res.status(201).json({
      success: true,
      message: "Meeting scheduled successfully",
      meeting: {
        meetingId: newMeeting.meeting_id,
        meetingDate: newMeeting.meeting_date,
        meetingLink: newMeeting.meeting_link
      }
    });

  } catch (error) {
    console.error("Error scheduling meeting:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Rechazar una postulación
router.put("/rejectPostulation", async (req, res) => {
  try {
    const userId = await getUserIdFromSession(req.headers["session-key"]);
    
    if (!userId || typeof userId !== "number") {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    // Verificar que el usuario es Delivery Lead
    const user = await prisma.users.findUnique({
      where: { user_id: userId },
      include: { Permits: true }
    });

    if (!user?.Permits?.is_delivery_lead) {
      return res.status(403).json({ error: "User is not a Delivery Lead" });
    }

    const { postulationId } = req.body;

    if (!postulationId) {
      return res.status(400).json({ error: "Missing postulationId" });
    }

    // Verificar que la postulación pertenece a un proyecto del DL
    const postulation = await prisma.postulations.findUnique({
      where: { postulation_id: postulationId },
      include: {
        Project_Positions: {
          include: {
            Projects: true
          }
        }
      }
    });

    if (!postulation) {
      return res.status(404).json({ error: "Postulation not found" });
    }

    if (postulation.Project_Positions?.Projects?.delivery_lead_user_id !== userId) {
      return res.status(403).json({ error: "Not authorized to reject this postulation" });
    }

    // Actualizar la postulación como no válida
    const updatedPostulation = await prisma.postulations.update({
      where: { postulation_id: postulationId },
      data: { valid: false }
    });

    res.status(200).json({ 
      success: true,
      message: "Postulation rejected successfully"
    });

  } catch (error) {
    console.error("Error rejecting postulation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Aceptar una postulación y asignar usuario al puesto
router.put("/acceptPostulation", async (req, res) => {
  try {
    const userId = await getUserIdFromSession(req.headers["session-key"]);
    
    if (!userId || typeof userId !== "number") {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    // Verificar que el usuario es Delivery Lead
    const user = await prisma.users.findUnique({
      where: { user_id: userId },
      include: { Permits: true }
    });

    if (!user?.Permits?.is_delivery_lead) {
      return res.status(403).json({ error: "User is not a Delivery Lead" });
    }

    const { postulationId } = req.body;

    if (!postulationId) {
      return res.status(400).json({ error: "Missing postulationId" });
    }

    // Verificar que la postulación existe y pertenece a un proyecto del DL
    const postulation = await prisma.postulations.findUnique({
      where: { postulation_id: postulationId },
      include: {
        Project_Positions: {
          include: {
            Projects: true
          }
        }
      }
    });

    if (!postulation) {
      return res.status(404).json({ error: "Postulation not found" });
    }

    // Verificar que el DL es el líder del proyecto
    if (postulation.Project_Positions?.Projects?.delivery_lead_user_id !== userId) {
      return res.status(403).json({ error: "Not authorized to accept postulations for this project" });
    }

    // Obtener el ID de la posición
    const positionId = postulation.project_position_id;
    if (!positionId) {
      return res.status(400).json({ error: "Postulation is not associated with a valid position" });
    }

    // Obtener el ID del usuario postulado
    const postulationUserId = postulation.user_id;
    if (!postulationUserId) {
      return res.status(400).json({ error: "Postulation is not associated with a valid user" });
    }

    // Iniciar transacción para asegurar la consistencia de los datos
    const result = await prisma.$transaction(async (prisma) => {
      // 1. Invalidar todas las postulaciones para esta posición
      await prisma.postulations.updateMany({
        where: {
          project_position_id: positionId,
          valid: true
        },
        data: {
          valid: false
        }
      });

      // 3. Asignar el usuario a la posición del proyecto
      const updatedPosition = await prisma.project_Positions.update({
        where: {
          position_id: positionId
        },
        data: {
          user_id: postulationUserId
        },
        include: {
          Projects: true,
          Users: true
        }
      });

      return updatedPosition;
    });

    res.status(200).json({ 
      success: true,
      message: "Postulation accepted and user assigned successfully",
      position: {
        positionId: result.position_id,
        positionName: result.position_name,
        projectName: result.Projects?.project_name,
        userName: result.Users?.name
      }
    });

  } catch (error) {
    console.error("Error accepting postulation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


export default router;