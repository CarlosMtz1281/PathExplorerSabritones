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
            Users: true,
            Postulations: {
              include: {
                Users: {
                  select: {
                    user_id: true,
                    name: true,
                    mail: true,
                  },
                },
                Meeting: true,
              },
            },
          },
        },
        Country: true,
        Users: true,
      },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Get team members from Project_Positions where user_id is not null
    const teamMembers = project.Project_Positions.filter(
      (position) => position.user_id !== null
    ).map((position) => ({
      user_id: position.user_id,
      project_id: projectId,
      Users: position.Users,
    }));

    // Format dates and structure project data
    const formattedProject = {
      id: project.project_id,
      name: project.project_name,
      description: project.project_desc,
      start_date: project.start_date
        ? project.start_date.toLocaleDateString("es-ES")
        : null,
      end_date: project.end_date
        ? project.end_date.toLocaleDateString("es-ES")
        : null,
      vacants: project.Project_Positions.filter((pos) => pos.user_id === null)
        .length,
      details: {
        company: project.company_name,
        country: project.Country?.country_name || "No country",
        capability: project.Users?.name || "No capability",
      },
      positions: project.Project_Positions.map((position) => ({
        position_id: position.position_id,
        project_id: position.project_id,
        position_name: position.position_name,
        position_desc: position.position_desc,
        user_id: position.user_id,
        Project_Position_Skills: position.Project_Position_Skills,
        Project_Position_Certificates: position.Project_Position_Certificates,
        Postulations: position.Postulations,
      })),
      team_members: teamMembers,
    };

    res.status(200).json(formattedProject);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/getProjectByIdCap/:projectId", async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);

    if (isNaN(projectId)) {
      return res.status(400).json({ error: "Invalid project ID" });
    }

    const userId = await getUserIdFromSession(req.headers["session-key"]);

    if (!userId || typeof userId !== "number") {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    const capability_id = await prisma.capability.findFirst({
      where: {
        capability_lead_id: userId,
      },
      select: {
        capability_id: true,
      },
    });

    const project = await prisma.projects.findUnique({
      where: {
        project_id: projectId,
      },
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
            Users: true,
            Postulations: {
              include: {
                Users: {
                  select: {
                    user_id: true,
                    name: true,
                    mail: true,
                  },
                },
                Meeting: true,
              },
            },
          },
          where: {
            capability_id: capability_id?.capability_id,
            user_id: null,
          },
        },
        Country: true,
        Users: true,
      },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Get team members from Project_Positions where user_id is not null
    const teamMembers = project.Project_Positions.filter(
      (position) => position.user_id !== null
    ).map((position) => ({
      user_id: position.user_id,
      project_id: projectId,
      Users: position.Users,
    }));

    // Format dates and structure project data
    const formattedProject = {
      id: project.project_id,
      name: project.project_name,
      description: project.project_desc,
      start_date: project.start_date
        ? project.start_date.toLocaleDateString("es-ES")
        : null,
      end_date: project.end_date
        ? project.end_date.toLocaleDateString("es-ES")
        : null,
      vacants: project.Project_Positions.filter((pos) => pos.user_id === null)
        .length,
      details: {
        company: project.company_name,
        country: project.Country?.country_name || "No country",
        capability: project.Users?.name || "No capability",
      },
      positions: project.Project_Positions.map((position) => ({
        position_id: position.position_id,
        project_id: position.project_id,
        position_name: position.position_name,
        position_desc: position.position_desc,
        user_id: position.user_id,
        Project_Position_Skills: position.Project_Position_Skills,
        Project_Position_Certificates: position.Project_Position_Certificates,
        Postulations: position.Postulations,
      })),
      team_members: teamMembers,
    };

    res.status(200).json(formattedProject);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/getFreeUsersOfCap", async (req, res) => {
  try {
    const userId = await getUserIdFromSession(req.headers["session-key"]);

    if (!userId || typeof userId !== "number") {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    const capability = await prisma.capability.findFirst({
      where: {
        capability_lead_id: userId,
      },
      select: {
        capability_id: true,
        capability_name: true,
        capability_lead_id: true,
      },
    });

    if (!capability) {
      return res
        .status(404)
        .json({ error: "Capability not found for this user" });
    }

    // free users are those who are not assigned to any project position and are part of the same capability (include the capability lead and people leads)
    const capabilityPeopleLeads = await prisma.capability_Employee.findMany({
      where: {
        capability_id: capability.capability_id,
      },
      select: {
        people_lead_id: true,
      },
    });
    const capability_Employees = await prisma.capability_Employee.findMany({
      where: {
        capability_id: capability.capability_id,
      },
      select: {
        employee_id: true,
      },
    });

    // add both
    const allEmployees = capabilityPeopleLeads
      .map((lead) => lead.people_lead_id)
      .concat(capability_Employees.map((emp) => emp.employee_id));

    // Get users currently assigned to ACTIVE project positions (projects that haven't ended yet)
    const assignedUsers = await prisma.project_Positions.findMany({
      where: {
        capability_id: capability.capability_id,
        NOT: { user_id: null },
        Projects: {
          OR: [
            { end_date: { gte: new Date() } }, // Project hasn't ended yet
            { end_date: null }, // Or project has no end date (ongoing)
          ],
        },
      },
      select: {
        user_id: true,
      },
    });

    const assignedUserIds = assignedUsers.map((user) => user.user_id);

    // Get free users who are not assigned to any project position free users are allEmployees - assignedUsers
    const freeUserIds = allEmployees.filter(
      (userId) => !assignedUserIds.includes(userId)
    );
    const freeUsers = await prisma.users.findMany({
      where: {
        user_id: { in: freeUserIds },
      },
      select: {
        user_id: true,
        name: true,
        mail: true,
        country_id: true,
        role_id: true,
      },
    });

    res.status(200).json(freeUsers);
  } catch (error) {
    console.error("Error fetching free users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/getAllUsersOfCap", async (req, res) => {
  try {
    const userId = await getUserIdFromSession(req.headers["session-key"]);

    if (!userId || typeof userId !== "number") {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    const capability = await prisma.capability.findFirst({
      where: {
        capability_lead_id: userId,
      },
      select: {
        capability_id: true,
        capability_name: true,
        capability_lead_id: true,
      },
    });

    if (!capability) {
      return res
        .status(404)
        .json({ error: "Capability not found for this user" });
    }

    // Get all users in this capability (including leads and employees)
    const capabilityPeopleLeads = await prisma.capability_Employee.findMany({
      where: {
        capability_id: capability.capability_id,
      },
      select: {
        people_lead_id: true,
      },
    });
    const capability_Employees = await prisma.capability_Employee.findMany({
      where: {
        capability_id: capability.capability_id,
      },
      select: {
        employee_id: true,
      },
    });

    // Combine all user IDs (people leads and employees)
    const allEmployeeIds = capabilityPeopleLeads
      .map((lead) => lead.people_lead_id)
      .concat(capability_Employees.map((emp) => emp.employee_id));

    // Get users currently assigned to ACTIVE project positions
    const assignedUsers = await prisma.project_Positions.findMany({
      where: {
        capability_id: capability.capability_id,
        NOT: { user_id: null },
        Projects: {
          OR: [
            { end_date: { gte: new Date() } }, // Project hasn't ended yet
            { end_date: null }, // Or project has no end date (ongoing)
          ],
        },
      },
      select: {
        user_id: true,
      },
    });

    const assignedUserIds = assignedUsers.map((user) => user.user_id);

    // Get all users in the capability (excluding role_id 4)
    const allUsers = await prisma.users.findMany({
      where: {
        user_id: { in: allEmployeeIds },
        NOT: { role_id: 4 }, // Exclude users with role_id 4
      },
      select: {
        user_id: true,
        name: true,
        mail: true,
        country_id: true,
        role_id: true,
      },
    });

    // Add isInProject boolean to each user
    const usersWithProjectStatus = allUsers.map(user => ({
      ...user,
      isInProject: assignedUserIds.includes(user.user_id)
    }));

    res.status(200).json(usersWithProjectStatus);
  } catch (error) {
    console.error("Error fetching capability users:", error);
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
      const capabilityId = await prisma.capability.findFirst({
        where: {
          capability_name: position.capability,
        },
        select: {
          capability_id: true,
        },
      });

      const createdPosition = await prisma.project_Positions.create({
        data: {
          project_id: project.project_id,
          position_name: position.name,
          position_desc: position.desc,
          capability_id: capabilityId?.capability_id || null,
          user_id: null,
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

router.get("/projectsByCapability", async (req, res) => {
  const userId = await getUserIdFromSession(req.headers["session-key"]);

  if (!userId || typeof userId !== "number") {
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  try {
    const cap_lead_user_id = userId;
    const leadId = Number(cap_lead_user_id);

    const capability = await prisma.capability.findFirst({
      where: {
        capability_lead_id: leadId,
      },
      select: {
        capability_id: true,
        capability_name: true,
      },
    });

    if (!capability) {
      return res
        .status(404)
        .json({ error: "Capability not found for this user" });
    }

    // Get all projects that have open project positions related to the capability
    const projects = await prisma.projects.findMany({
      where: {
        Project_Positions: {
          some: {
            capability_id: capability.capability_id, // Use the capability_id here
            user_id: null,
          },
        },
      },
      include: {
        Project_Positions: {
          where: {
            capability_id: capability.capability_id,
            user_id: null,
          },
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
            Project_Position_Areas: {
              include: {
                Areas: true,
              },
            },
          },
        },
        Country: true,
        Users: true, // This is the delivery lead
      },
    });

    // Format the response to make it more client-friendly
    const formattedProjects = projects.map((project) => ({
      project_id: project.project_id,
      project_name: project.project_name,
      company_name: project.company_name,
      project_desc: project.project_desc,
      start_date: project.start_date,
      end_date: project.end_date,
      country: project.Country,
      delivery_lead: project.Users,
      capability_name: capability.capability_name,
      open_positions: project.Project_Positions.map((position) => ({
        position_id: position.position_id,
        position_name: position.position_name,
        position_desc: position.position_desc,
        required_skills: position.Project_Position_Skills.map(
          (skill) => skill.Skills
        ),
        required_certificates: position.Project_Position_Certificates.map(
          (cert) => cert.Certificates
        ),
        required_areas: position.Project_Position_Areas.map(
          (area) => area.Areas
        ),
      })),
    }));

    res.json(formattedProjects);
  } catch (error) {
    console.error("Error fetching projects by capability:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.get("/getTeamMembers/:projectId", async (req, res) => {
  console.log("Fetching team members for project:", req.params.projectId);
  try {
    const projectId = parseInt(req.params.projectId);

    if (isNaN(projectId)) {
      return res.status(400).json({ error: "Invalid project ID" });
    }

    const userId = await getUserIdFromSession(req.headers["session-key"]);
    if (!userId || typeof userId !== "number") {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    const project = await prisma.projects.findUnique({
      where: { project_id: projectId },
      include: {
        Project_Positions: {
          where: { user_id: { not: null } },
          include: {
            Users: true,
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const teamMembers = project.Project_Positions.map((position) => ({
      user_id: position.user_id,
      name: position.Users.name,
      mail: position.Users.mail,
      country_id: position.Users.country_id,
      position_name: position.position_name,
    }));

    res.status(200).json(teamMembers);
  } catch (error) {
    console.error("Error fetching team members:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/postulate", async (req, res) => {
  try {
    // Verify session
    const sessionUserId = await getUserIdFromSession(
      req.headers["session-key"]
    );
    if (!sessionUserId || typeof sessionUserId !== "number") {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    // Validate request body - now accessing the body directly
    const { user_id, position_id } = req.body;

    console.log("Postulation request body:", req.body);

    if (user_id === undefined || position_id === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const userId = parseInt(user_id.toString());
    const positionId = parseInt(position_id.toString());

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user_id parameter" });
    }
    if (isNaN(positionId)) {
      return res.status(400).json({ error: "Invalid position_id parameter" });
    }

    // Verify the position exists and is available
    const position = await prisma.project_Positions.findFirst({
      where: {
        position_id: positionId,
        user_id: null, // Ensure position is still available
      },
    });

    if (!position) {
      return res.status(404).json({
        error: "Position not found or already filled",
      });
    }

    // Check for existing postulation
    const existingPostulation = await prisma.postulations.findFirst({
      where: {
        project_position_id: positionId,
        user_id: userId,
      },
    });

    if (existingPostulation) {
      return res.status(409).json({
        error: "You have already postulated for this position",
      });
    }

    // Create postulation
    const postulation = await prisma.postulations.create({
      data: {
        project_position_id: positionId,
        user_id: userId,
        postulation_date: new Date(),
      },
      include: {
        Project_Positions: {
          include: {
            Projects: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Postulation created successfully",
      data: {
        position_name: postulation.Project_Positions?.position_name,
        project_name: postulation.Project_Positions?.Projects?.project_name,
      },
    });
  } catch (error) {
    console.error("Error in postulation:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// New endpoint to get all projects associated with a delivery lead
router.get(
  "/repositories/deliveryProjects/:deliveryLeadId",
  async (req, res) => {
    try {
      const deliveryLeadId = req.params.deliveryLeadId;

      if (!deliveryLeadId) {
        return res.status(400).json({ error: "Delivery lead ID is required" });
      }

      const deliveryLeadIdNum = parseInt(deliveryLeadId);

      if (isNaN(deliveryLeadIdNum)) {
        return res.status(400).json({ error: "Invalid delivery lead ID" });
      }

      const projects = await prisma.projects.findMany({
        where: {
          delivery_lead_user_id: deliveryLeadIdNum,
        },
        include: {
          Project_Positions: true,
          Country: true,
          Users: true,
        },
      });

      const formattedProjects = projects.map((project) => ({
        id: project.project_id,
        name: project.project_name,
        description: project.project_desc,
        start_date: project.start_date
          ? project.start_date.toLocaleDateString("es-ES")
          : null,
        end_date: project.end_date
          ? project.end_date.toLocaleDateString("es-ES")
          : null,
        vacants: project.Project_Positions.filter((pos) => pos.user_id === null)
          .length,
        filled_positions: project.Project_Positions.filter(
          (pos) => pos.user_id !== null
        ).length,
        total_positions: project.Project_Positions.length,
        details: {
          company: project.company_name,
          country: project.Country?.country_name || "No country",
          capability: project.Users?.name || "No capability",
        },
      }));

      res.status(200).json(formattedProjects);
    } catch (error) {
      console.error("Error fetching delivery lead projects:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.get("/getCurrentProjectsDL", async (req, res) => {
  try {
    const userId = await getUserIdFromSession(req.headers["session-key"]);

    if (!userId || typeof userId !== "number") {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    const currentDate = new Date();
    const projects = await prisma.projects.findMany({
      where: {
        delivery_lead_user_id: userId,
        start_date: { lte: currentDate },
        OR: [{ end_date: { gte: currentDate } }, { end_date: null }],
      },
      include: {
        Country: { select: { country_name: true } },
        Project_Positions: {
          include: {
            Feedback: true,
          },
        },
      },
    });

    const formattedProjects = projects.map((project) => ({
      id: project.project_id,
      name: project.project_name,
      description: project.project_desc,
      start_date: project.start_date
        ? project.start_date.toLocaleDateString("es-ES")
        : null,
      end_date: project.end_date
        ? project.end_date.toLocaleDateString("es-ES")
        : null,
      percentCompletedDays: Math.round(
        ((currentDate.getTime() - new Date(project.start_date).getTime()) /
          (new Date(project.end_date).getTime() -
            new Date(project.start_date).getTime())) *
          100
      ),
      daysRemaining: Math.ceil(
        (new Date(project.end_date).getTime() - currentDate.getTime()) /
          (1000 * 60 * 60 * 24)
      ),
      country: project.Country?.country_name || "No country",
      company: project.company_name,
      people: project.Project_Positions.length,
      feedbacks: project.Project_Positions.reduce(
        (acc, position) =>
          acc + (position.Feedback ? position.Feedback.length : 0),
        0
      ),
    }));

    res.status(200).json(formattedProjects);
  } catch (error) {
    console.error("Error fetching current projects for DL:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/employeesByProject/:projectId", async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    if (isNaN(projectId)) {
      return res.status(400).json({ error: "Invalid project ID" });
    }

    const userId = await getUserIdFromSession(req.headers["session-key"]);
    if (!userId || typeof userId !== "number") {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    const role = await prisma.users.findUnique({
      where: { user_id: userId },
      select: { role_id: true },
    });

    if (role?.role_id !== 4) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const project = await prisma.projects.findUnique({
      where: { project_id: projectId },
      include: {
        Project_Positions: {
          where: { user_id: { not: null } },
          include: {
            Users: {
              select: {
                user_id: true,
                name: true,
                mail: true,
                country_id: true,
              },
            },
            Feedback: {
              select: {
                feedback_id: true,
                desc: true,
                score: true,
              },
            },
          },
        },
      },
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const employees = project.Project_Positions.map((position) => ({
      user_id: position.Users.user_id,
      name: position.Users.name,
      position_name: position.position_name,
      position_id: position.position_id,
      feedbacks: position.Feedback.map((feedback) => ({
        feedback_id: feedback.feedback_id,
        desc: feedback.desc,
        score: feedback.score,
      })),
    }));

    const allRolesInProject = project.Project_Positions.map(
      (position) => position.position_name
    );
    const uniqueRoles = Array.from(new Set(allRolesInProject));

    const response = {
      employees,
      uniqueRoles,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching employees by project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/closeProject", async (req, res) => {
  try {
    const { projectId } = req.body;
    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    const userId = await getUserIdFromSession(req.headers["session-key"]);
    if (!userId || typeof userId !== "number") {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    const role = await prisma.users.findUnique({
      where: { user_id: userId },
      select: { role_id: true },
    });

    if (role?.role_id !== 4) {
      return res.status(403).json({ error: "Unauthorized to close project" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    today.setHours(today.getHours() - 6);

    const updatedProject = await prisma.projects.update({
      where: { project_id: projectId },
      data: { end_date: today },
    });

    res.status(200).json({
      message: "Project closed successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Error closing project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/feedbacks", async (req, res) => {
  try {
    const { projectId, feedbacks } = req.body;
    if (!projectId || !Array.isArray(feedbacks)) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    const userId = await getUserIdFromSession(req.headers["session-key"]);
    if (!userId || typeof userId !== "number") {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    const role = await prisma.users.findUnique({
      where: { user_id: userId },
      select: { role_id: true },
    });

    if (role?.role_id !== 4) {
      return res
        .status(403)
        .json({ error: "Unauthorized to update feedbacks" });
    }

    const updatedFeedbacks = await Promise.all(
      feedbacks.map(async (feedback) => {
        const { feedback_id, position_id, desc, score } = feedback;

        if (
          !position_id ||
          typeof desc !== "string" ||
          typeof score !== "number"
        ) {
          throw new Error("Invalid feedback data");
        }

        if (feedback_id) {
          return prisma.feedback.upsert({
            where: {
              feedback_id: feedback_id,
            },
            create: {
              position_id,
              desc,
              score,
            },
            update: {
              desc,
              score,
            },
          });
        } else {
          return prisma.feedback.create({
            data: {
              position_id,
              desc,
              score,
            },
          });
        }
      })
    );

    res.status(200).json({
      message: "Feedbacks updated successfully",
      feedbacks: updatedFeedbacks,
    });
  } catch (error) {
    console.error("Error updating feedbacks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/getPastProjectsDL", async (req, res) => {
  try {
    const userId = await getUserIdFromSession(req.headers["session-key"]);
    if (!userId || typeof userId !== "number") {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    const role = await prisma.users.findUnique({
      where: { user_id: userId },
      select: { role_id: true },
    });

    if (role?.role_id !== 4) {
      return res
        .status(403)
        .json({ error: "Unauthorized to view past projects" });
    }

    const currentDate = new Date();
    const projects = await prisma.projects.findMany({
      where: {
        delivery_lead_user_id: userId,
        end_date: { lt: currentDate },
      },
      include: {
        Country: { select: { country_name: true } },
        Project_Positions: {
          include: {
            Feedback: true,
          },
        },
      },
    });

    const formattedProjects = projects.map((project) => ({
      id: project.project_id,
      name: project.project_name,
      description: project.project_desc,
      start_date: project.start_date
        ? project.start_date.toLocaleDateString("es-ES")
        : null,
      end_date: project.end_date
        ? project.end_date.toLocaleDateString("es-ES")
        : null,
      country: project.Country?.country_name || "No country",
      company: project.company_name,
      people: project.Project_Positions.length,
      feedbacks: project.Project_Positions.reduce(
        (acc, position) =>
          acc + (position.Feedback ? position.Feedback.length : 0),
        0
      ),
    }));

    res.status(200).json(formattedProjects);
  } catch (error) {
    console.error("Error fetching past projects for DL:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.get("/getMeetings", async (req, res) => {
  try {
    // Get user ID from session
    const userId = await getUserIdFromSession(req.headers["session-key"]);
    if (!userId || typeof userId !== "number") {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    // Get all meetings where the user is either:
    // 1. The participant (through postulation)
    // 2. The delivery lead of the project
    // 3. The capability lead of the position's capability
    const meetings = await prisma.meeting.findMany({
      where: {
        OR: [
          // Meetings where user is the participant
          {
            Postulations: {
              user_id: userId,
              valid: true, // Ensure postulation is valid
            }
          },
          // Meetings where user is the delivery lead of the project
          {
            Postulations: {
              Project_Positions: {
                Projects: {
                  delivery_lead_user_id: userId
                }
              },
              valid: true // Ensure postulation is valid
            }
          }
        ],
        // add condition of postulation being valid
      },
      include: {
        Postulations: {
          include: {
            Users: {
              select: {
                user_id: true,
                name: true,
                mail: true
              }
            },
            Project_Positions: {
              include: {
                Projects: {
                  select: {
                    project_id: true,
                    project_name: true,
                    company_name: true
                  }
                },
                Capability: {
                  select: {
                    capability_id: true,
                    capability_name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        meeting_date: 'asc' // Sort by meeting date ascending
      }
    });

    // Format the response
    const formattedMeetings = meetings.map(meeting => ({
      meeting_id: meeting.meeting_id,
      meeting_date: meeting.meeting_date,
      meeting_link: meeting.meeting_link,
      participant: meeting.Postulations.Users,
      project: {
        id: meeting.Postulations.Project_Positions.Projects.project_id,
        name: meeting.Postulations.Project_Positions.Projects.project_name,
        company: meeting.Postulations.Project_Positions.Projects.company_name
      },
      position: {
        id: meeting.Postulations.Project_Positions.position_id,
        name: meeting.Postulations.Project_Positions.position_name,
        capability: meeting.Postulations.Project_Positions.Capability
      },
      postulation_date: meeting.Postulations.postulation_date
    }));

    res.status(200).json(formattedMeetings);
  } catch (error) {
    console.error("Error fetching meetings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
