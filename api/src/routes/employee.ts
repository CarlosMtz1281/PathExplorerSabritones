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
      return res
        .status(400)
        .json({ error: "User ID is required in the headers." });
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
            Certificates: {
              include: {
                Certificate_Skills: {
                  include: {
                    Skills: true,
                  },
                },
              },
            },
          },
        },
        Employee_Position: {
          include: {
            Work_Position: true,
          },
          orderBy: {
            start_date: "desc",
          },
          take: 1,
        },
        Project_Positions: {
          where: {
            user_id: userId,
          },
          include: {
            Projects: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Check if user is in any active project
    const currentDate = new Date();
    const isInProject = user.Project_Positions.some((position) => {
      return (
        position.Projects.end_date === null ||
        new Date(position.Projects.end_date) > currentDate
      );
    });

    // Extract level and position name from the most recent employee position
    const currentPosition = user.Employee_Position[0];
    const level = currentPosition?.level || null;
    const positionName =
      currentPosition?.Work_Position?.position_name || "Sin posición";

    // Format the response
    const formattedUser = {
      ...user,
      level,
      position_name: positionName,
      in_project: isInProject,
    };

    res.status(200).json(formattedUser);
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

router.delete("/skills/:skillId", async (req, res) => {
  try {
    const userId = await getUserIdFromSession(req.headers["session-key"]);
    const skillId = parseInt(req.params.skillId);
    if (!userId) {
      return res
        .status(400)
        .json({ error: "Session key is required in the headers." });
    }
    if (typeof userId !== "number") {
      return res.status(400).json({ error: "Timeout session" });
    }

    const skill = await prisma.user_Skills.delete({
      where: {
        user_id_skill_id: {
          user_id: userId,
          skill_id: skillId,
        },
      },
    });

    if (!skill) {
      return res.status(404).json({ error: "Skill not found." });
    }

    res.status(200).json({ message: "Skill deleted successfully." });
  } catch (error) {
    console.error("Error deleting user skill:", error);
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

router.get("/getCapabilityTeamMembers/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);

  if (isNaN(userId)) {
    return res.status(400).json({ error: "Invalid project ID" });
  }
  try {
    // Get the user's capability information as an employee
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

    // Check if user is an employee in a capability
    if (
      user.Capability_Employee_Capability_Employee_employee_idToUsers.length > 0
    ) {
      capabilityId =
        user.Capability_Employee_Capability_Employee_employee_idToUsers[0]
          .capability_id;
    }

    // If not an employee, check if user is a people lead
    if (!capabilityId) {
      const peopleLead = await prisma.capability_People_Lead.findFirst({
        where: { capability_pl_id: userId },
      });

      if (peopleLead) {
        capabilityId = peopleLead.capability_id;
      }
    }

    // If not an employee or people lead, check if user is a capability lead
    if (!capabilityId) {
      const capabilityLead = await prisma.capability.findFirst({
        where: { capability_lead_id: userId },
      });

      if (capabilityLead) {
        capabilityId = capabilityLead.capability_id;
      }
    }

    if (!capabilityId) {
      return res.status(200).json([]); // User doesn't belong to any capability in any role
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

    // Check if user is assigned to any active project positions
    const activeProjects = await prisma.project_Positions.findMany({
      where: {
        user_id: userId,
        Projects: {
          OR: [{ end_date: null }, { end_date: { gt: today } }],
        },
      },
      select: {
        project_id: true,
      },
    });

    // If user has any active project positions, they're not staff
    const isStaff = activeProjects.length === 0;

    res.status(200).json({
      message: "Staff status updated successfully",
      isStaff: isStaff,
    });
  } catch (err) {
    console.error("Error checking staff status:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// CRON JOB endpoint - checks all users
router.patch("/checkstaffall", async (req, res) => {
  try {
    const today = new Date();

    // Get all users with their project assignments
    const usersWithProjects = await prisma.users.findMany({
      select: {
        user_id: true,
        Project_Positions: {
          select: {
            Projects: {
              select: {
                end_date: true,
              },
            },
          },
        },
      },
    });

    // Determine staff status for each user
    const updates = usersWithProjects.map((user) => {
      const isInActiveProject = user.Project_Positions.some((position) => {
        return (
          position.Projects.end_date === null ||
          new Date(position.Projects.end_date) > today
        );
      });

      return {
        user_id: user.user_id,
        isStaff: !isInActiveProject,
        in_project: isInActiveProject, // for backward compatibility
      };
    });

    const staffCount = updates.filter((u) => u.isStaff).length;
    const nonStaffCount = updates.length - staffCount;

    res.status(200).json({
      message: `Staff status updated for all users`,
      staff_count: staffCount,
      non_staff_count: nonStaffCount,
    });
  } catch (err) {
    console.error("Error updating staff statuses:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// regresa todos los usuarios
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
        Project_Positions: {
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

      const skills =
        user.User_Skills?.map((us) => us.Skills.name || "N/A") || [];

      const certifications =
        user.Certificate_Users?.map(
          (cu) => cu.Certificates.certificate_name || "N/A"
        ) || [];

      const projects =
        user.Project_Positions?.map((pp) => pp.Projects?.project_name).filter(
          Boolean
        ) || [];

      const positions_from_projects =
        user.Project_Positions?.map((pp) => pp.position_name).filter(Boolean) ||
        [];

      const positions_from_employee =
        user.Employee_Position?.map(
          (ep) => ep.Work_Position?.position_name
        ).filter(Boolean) || [];

      // Fusiona ambas listas de posiciones si quieres mantener ambas fuentes
      const all_positions = [
        ...new Set([...positions_from_employee, ...positions_from_projects]),
      ];

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
        position_names:
          all_positions.length > 0 ? all_positions : ["Sin posición"],
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
      const sessionResult = await getUserIdFromSession(
        req.headers["session-key"]
      );
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

    // Fetch projects where user is assigned directly to a Project_Position
    const projectPositions = await prisma.project_Positions.findMany({
      where: { user_id: userId },
      include: {
        Projects: {
          include: {
            Country: true,
            Users: true, // Delivery lead
          },
        },
        Project_Position_Skills: {
          include: { Skills: true },
        },
        Feedback: true, // Include feedback directly
        Project_Position_Areas: {
          include: { Areas: true },
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

    const projects = projectPositions.map((pos) => {
      const project = pos.Projects;
      const feedback = pos.Feedback[0]; // Get first feedback if exists

      return {
        projectName: project.project_name || "Unknown",
        company: project.company_name || "Unknown",
        positionName: pos.position_name || "No position assigned",
        projectDescription: project.project_desc || "No description",
        startDate: formatDate(project.start_date),
        endDate: formatDate(project.end_date),
        feedbackDesc: feedback?.desc || "No feedback",
        feedbackScore: feedback?.score || null,
        deliveryLeadName: project.Users?.name || "Unknown Lead",
        skills: pos.Project_Position_Skills.map((s) => s.Skills.name),
        areas: pos.Project_Position_Areas.map((a) => a.Areas.area_name),
        rawStart: project.start_date,
        rawEnd: project.end_date,
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

    const { company, position_name, position_desc, start_date, end_date } =
      req.body;

    // Validación de datos requeridos
    if (!company || !position_name || !start_date || !end_date) {
      return res.status(400).json({
        error:
          "Missing required fields. Company, position name, start date and end date are required.",
      });
    }

    // Crear nueva posición de trabajo
    const position = await prisma.work_Position.create({
      data: {
        position_name,
        position_desc: position_desc || "",
        company,
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
        end_date,
      },
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

    const { company, position_name, position_desc, start_date, end_date } =
      req.body;

    // Validación de datos requeridos
    if (!company || !position_name || !start_date || !end_date) {
      return res.status(400).json({
        error:
          "Missing required fields. Company, position name, start date and end date are required.",
      });
    }

    // Verificar que la posición pertenece al usuario
    const existingPosition = await prisma.employee_Position.findFirst({
      where: {
        user_id: userId,
        position_id: positionId,
      },
    });

    if (!existingPosition) {
      return res.status(404).json({
        error: "Position not found or doesn't belong to user",
      });
    }

    // Actualizar la posición de trabajo
    const updatedPosition = await prisma.work_Position.update({
      where: { position_id: positionId },
      data: {
        position_name,
        position_desc: position_desc || "",
        company,
      },
    });

    // Actualizar las fechas en employee_Position
    await prisma.employee_Position.update({
      where: {
        position_id_user_id: {
          user_id: userId,
          position_id: positionId,
        },
      },
      data: {
        start_date: new Date(start_date),
        end_date: new Date(end_date),
      },
    });

    res.status(200).json({
      message: "Experience updated successfully",
      data: {
        position_id: updatedPosition.position_id,
        company,
        position_name,
        position_desc: position_desc || "",
        start_date,
        end_date,
      },
    });
  } catch (error) {
    console.error("Error updating experience:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/me", async (req, res) => {
  try {
    const userId = await getUserIdFromSession(req.headers["session-key"]);

    if (!userId || userId === "timeout") {
      return res.status(400).json({ error: "Invalid or expired session" });
    }

    const user = await prisma.users.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        name: true,
        mail: true,
        role_id: true,
        Country: {
          select: {
            country_name: true,
            timezone: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching session user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/is-subordinate", async (req, res) => {
  try {
    const viewerId = parseInt(req.query.viewer as string);
    const targetId = parseInt(req.query.target as string);

    if (isNaN(viewerId) || isNaN(targetId)) {
      return res
        .status(400)
        .json({ subordinado: false, error: "Invalid parameters" });
    }

    const viewer = await prisma.users.findUnique({
      where: { user_id: viewerId },
      select: { role_id: true },
    });

    if (!viewer) {
      return res
        .status(404)
        .json({ subordinado: false, error: "Viewer not found" });
    }

    // 👤 People Lead: verifica si el target es su subordinado directo
    if (viewer.role_id === 2) {
      const match = await prisma.capability_Employee.findFirst({
        where: {
          people_lead_id: viewerId,
          employee_id: targetId,
        },
      });

      return res.json({ subordinado: !!match });
    }

    // 👑 Capability Lead: busca primero su capability_id como capability_lead
    if (viewer.role_id === 3) {
      const capability = await prisma.capability.findFirst({
        where: { capability_lead_id: viewerId },
        select: { capability_id: true },
      });

      if (!capability) {
        return res.json({ subordinado: false });
      }

      const capabilityId = capability.capability_id;

      // Buscar todos los registros en capability_Employee con ese capability_id
      const relations = await prisma.capability_Employee.findMany({
        where: { capability_id: capabilityId },
        select: {
          people_lead_id: true,
          employee_id: true,
        },
      });

      const peopleLeadIds = new Set<number>();
      const employeeIds = new Set<number>();

      for (const row of relations) {
        if (row.people_lead_id) peopleLeadIds.add(row.people_lead_id);
        if (row.employee_id) employeeIds.add(row.employee_id);
      }

      const isSubordinate =
        peopleLeadIds.has(targetId) || employeeIds.has(targetId);

      return res.json({ subordinado: isSubordinate });
    }

    // Otros roles no tienen subalternos por jerarquía
    return res.json({ subordinado: false });
  } catch (error) {
    console.error("Error in /is-subordinate:", error);
    res.status(500).json({ subordinado: false, error: "Server error" });
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
        position_id: positionId,
      },
    });

    if (!existingPosition) {
      return res.status(404).json({
        error: "Position not found or doesn't belong to user",
      });
    }

    // Obtener información sobre la posición antes de borrar
    const positionInfo = await prisma.work_Position.findUnique({
      where: { position_id: positionId },
    });

    // Eliminar la relación employee_Position primero (debido a las restricciones de clave foránea)
    await prisma.employee_Position.delete({
      where: {
        position_id_user_id: {
          user_id: userId,
          position_id: positionId,
        },
      },
    });

    // Eliminar la posición de trabajo
    await prisma.work_Position.delete({
      where: { position_id: positionId },
    });

    res.status(200).json({
      message: "Experience deleted successfully",
      data: {
        position_id: positionId,
        company: positionInfo?.company,
        position_name: positionInfo?.position_name,
      },
    });
  } catch (error) {
    console.error("Error deleting experience:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
