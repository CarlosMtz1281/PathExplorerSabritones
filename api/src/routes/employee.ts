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

router.get("/user/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    if (!userId) {
      return res.status(400).json({ error: "User ID is required in the headers." });
    }

    const user = await prisma.users.findUnique({
      where: { user_id: userId },
            include: {
      Country: {
        select: {
          country_name: true,
          timezone: true,
        },
      },
      Permits: true,
      Certificate_Users: {
        include: {
        Certificates: true,
        },
      },
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
    is_admin,
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


router.get("/list", async (req, res) => {
  try {
    const employees = await prisma.users.findMany({
      where: {
        Permits: {
          is_admin: false,
        },
      },
      include: {
        Country: {
          select: { country_name: true },
        },
        Capability_Employee_Capability_Employee_employee_idToUsers: {
          include: {
            Capability: {
              select: {
                capability_name: true,
              },
            },
            Users_Capability_Employee_employee_idToUsers: {
              select: {
                name: true,
              },
            },
          },
        },
        User_Skills: {
          include: {
            Skills: {
              select: {
                name: true,
              },
            },
          },
        },
        Certificate_Users: {
          include: {
            Certificates: {
              select: {
                certificate_name: true,
              },
            },
          },
        },
        Project_User: {
          include: {
            Projects: {
              select: {
                project_name: true,
              },
            },
          },
        },
        Employee_Position: {
          include: {
            Work_Position: {
              select: {
                position_name: true,
              },
            },
          },
        },
      },
    });

    const formatted = employees.map((user) => {
      const capEntry =
        user.Capability_Employee_Capability_Employee_employee_idToUsers[0];
      const capabilityName = capEntry?.Capability?.capability_name || "N/A";
      const capabilityLead =
        capEntry?.Users_Capability_Employee_employee_idToUsers?.name || "N/A";

      const skills = user.User_Skills?.map((us) => us.Skills.name || "N/A") || [];

      const certifications =
        user.Certificate_Users?.map((cu) => cu.Certificates.certificate_name || "N/A") || [];

      const projects =
        user.Project_User?.map((pu) => pu.Projects?.project_name).filter(Boolean) || [];

      const positions =
        user.Employee_Position?.map((ep) => ep.Work_Position?.position_name).filter(Boolean) || [];

      return {
        user_id: user.user_id,
        name: user.name || "N/A",
        mail: user.mail || "N/A",
        hire_date: user.hire_date,
        country: user.Country?.country_name || "N/A",
        capability_name: capabilityName,
        capability_lead: capabilityLead,
        skills,
        certifications,
        project_names: projects.length > 0 ? projects : ["Staff"],
        position_names: positions.length > 0 ? positions : ["Sin posición"],
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching employee list:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/experience", async (req, res) => {
  try {
    // 🔍 Usa query param si existe, si no usa sesión
    let userId = req.query.userId ? parseInt(req.query.userId as string) : null;

    if (!userId) {
      const sessionResult = await getUserIdFromSession(req.headers["session-key"]);
      if (sessionResult === "timeout" || typeof sessionResult !== "number") {
        return res.status(400).json({ error: "Missing or invalid user ID" });
      }
      userId = sessionResult;
    }
    

    // Fetch jobs
    const workPositions = await prisma.employee_Position.findMany({
      where: { user_id: userId },
      include: { Work_Position: true },
      orderBy: { start_date: "asc" },
    });

    // Fetch projects
    const userProjects = await prisma.project_User.findMany({
      where: { user_id: userId },
      include: {
        Projects: {
          include: {
            Country: true,
            Users: true, // Delivery lead
            Project_Positions: {
              where: { user_id: userId },
              include: {
                Project_Position_Skills: {
                  include: { Skills: true },
                },
              },
            },
            Feedback: {
              where: { user_id: userId },
            },
          },
        },
      },
    });

    const formatDate = (date: Date | null) =>
      date ? new Date(date).toLocaleDateString("es-ES") : "Actualidad";

    const jobs = workPositions.map((pos) => ({
      positionId: pos.position_id,
      company: pos.Work_Position.company || "Unknown",
      position: pos.Work_Position.position_name || "Unknown",
      positionDesc: pos.Work_Position.position_desc || "No description",
      startDate: formatDate(pos.start_date),
      endDate: formatDate(pos.end_date),
      rawStart: pos.start_date,
      rawEnd: pos.end_date,
    }));

    const projects = userProjects.map((proj) => {
      const position = proj.Projects.Project_Positions[0];
      const feedback = proj.Projects.Feedback[0];

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

// Endpoint para agregar una nueva experiencia laboral
router.post("/addExperience", async (req, res) => {
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

    const { company, position_name, position_desc, start_date, end_date } = req.body;

    // Validación de datos requeridos
    if (!company || !position_name || !start_date || !end_date) {
      return res.status(400).json({ 
        error: "Missing required fields. Company, position name, start date and end date are required."
      });
    }

    // Crear nueva posición de trabajo
    const position = await prisma.work_Position.create({
      data: {
        position_name,
        position_desc: position_desc || "",
        company
      },
    });

    // Asociar la posición con el empleado
    await prisma.employee_Position.create({
      data: {
        user_id: userId,
        position_id: position.position_id,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
      },
    });

    // Actualizar el estado de in_project del usuario si es necesario
    const today = new Date();
    const endDateObj = new Date(end_date);
    
    if (endDateObj > today) {
      await prisma.users.update({
        where: { user_id: userId },
        data: { in_project: true },
      });
    }

    // console.log("Experience added successfully:", {
    //   userId,
    //   company,
    //   position_name,
    //   position_desc,
    //   start_date,
    //   end_date,
    // });
    // Respuesta exitosa
    res.status(201).json({ 
      message: "Experience added successfully",
      data: {
        position_id: position.position_id,
        company,
        position_name,
        position_desc: position_desc || "",
        start_date,
        end_date
      }
    });
  } catch (error) {
    console.error("Error adding experience:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint para actualizar una experiencia laboral existente
router.put("/updateExperience/:positionId", async (req, res) => {
  try {
    const userId = await getUserIdFromSession(req.headers["session-key"]);
    const positionId = parseInt(req.params.positionId);

    if (!userId) {
      return res
        .status(400)
        .json({ error: "Session key is required in the headers." });
    }

    if (typeof userId !== "number") {
      return res.status(400).json({ error: "Timeout session" });
    }

    if (isNaN(positionId)) {
      return res.status(400).json({ error: "Invalid position ID" });
    }

    const { company, position_name, position_desc, start_date, end_date } = req.body;

    // Validación de datos requeridos
    if (!company || !position_name || !start_date || !end_date) {
      return res.status(400).json({ 
        error: "Missing required fields. Company, position name, start date and end date are required."
      });
    }

    // Verificar que la posición pertenece al usuario
    const existingPosition = await prisma.employee_Position.findFirst({
      where: {
        user_id: userId,
        position_id: positionId
      }
    });

    if (!existingPosition) {
      return res.status(404).json({ 
        error: "Position not found or doesn't belong to user" 
      });
    }

    // Actualizar la posición de trabajo
    const updatedPosition = await prisma.work_Position.update({
      where: { position_id: positionId },
      data: {
        position_name,
        position_desc: position_desc || "",
        company
      },
    });

    // Actualizar las fechas en employee_Position
    await prisma.employee_Position.update({
      where: {
        position_id_user_id: {
          user_id: userId,
          position_id: positionId
        }
      },
      data: {
        start_date: new Date(start_date),
        end_date: new Date(end_date),
      },
    });

    // Actualizar el estado de in_project del usuario si es necesario
    const today = new Date();
    const endDateObj = new Date(end_date);
    
    if (endDateObj > today) {
      await prisma.users.update({
        where: { user_id: userId },
        data: { in_project: true },
      });
    } else {
      // Verificar si el usuario tiene otras posiciones activas
      const activePositions = await prisma.employee_Position.findMany({
        where: {
          user_id: userId,
          OR: [
            { end_date: null },
            { end_date: { gt: today } }
          ]
        }
      });

      if (activePositions.length === 0) {
        await prisma.users.update({
          where: { user_id: userId },
          data: { in_project: false },
        });
      }
    }

    res.status(200).json({ 
      message: "Experience updated successfully",
      data: {
        position_id: updatedPosition.position_id,
        company,
        position_name,
        position_desc: position_desc || "",
        start_date,
        end_date
      }
    });
  } catch (error) {
    console.error("Error updating experience:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint para eliminar una experiencia laboral
router.delete("/deleteExperience/:positionId", async (req, res) => {
  try {
    const userId = await getUserIdFromSession(req.headers["session-key"]);
    const positionId = parseInt(req.params.positionId);

    if (!userId) {
      return res
        .status(400)
        .json({ error: "Session key is required in the headers." });
    }

    if (typeof userId !== "number") {
      return res.status(400).json({ error: "Timeout session" });
    }

    if (isNaN(positionId)) {
      return res.status(400).json({ error: "Invalid position ID" });
    }

    // Verificar que la posición pertenece al usuario
    const existingPosition = await prisma.employee_Position.findFirst({
      where: {
        user_id: userId,
        position_id: positionId
      }
    });

    if (!existingPosition) {
      return res.status(404).json({ 
        error: "Position not found or doesn't belong to user" 
      });
    }

    // Obtener información sobre la posición antes de borrar
    const positionInfo = await prisma.work_Position.findUnique({
      where: { position_id: positionId }
    });

    // Eliminar la relación employee_Position primero (debido a las restricciones de clave foránea)
    await prisma.employee_Position.delete({
      where: {
        position_id_user_id: {
          user_id: userId,
          position_id: positionId
        }
      }
    });

    // Eliminar la posición de trabajo
    await prisma.work_Position.delete({
      where: { position_id: positionId }
    });

    // Verificar si el usuario necesita actualizar su estado in_project
    const today = new Date();
    const wasActivePosition = !existingPosition.end_date || 
                            new Date(existingPosition.end_date) > today;

    if (wasActivePosition) {
      // Verificar si el usuario tiene otras posiciones activas
      const remainingPositions = await prisma.employee_Position.findMany({
        where: {
          user_id: userId,
          OR: [
            { end_date: null },
            { end_date: { gt: today } }
          ]
        }
      });

      if (remainingPositions.length === 0) {
        await prisma.users.update({
          where: { user_id: userId },
          data: { in_project: false },
        });
      }
    }

    res.status(200).json({ 
      message: "Experience deleted successfully",
      data: {
        position_id: positionId,
        company: positionInfo?.company,
        position_name: positionInfo?.position_name
      }
    });
  } catch (error) {
    console.error("Error deleting experience:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
