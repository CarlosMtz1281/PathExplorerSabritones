// File: cl.ts
import express from "express";
import dotenv from "dotenv";
import prisma from "../db/prisma";
import { getUserIdFromSession } from "../utils/session";

dotenv.config();

const router = express.Router();

router.get("/", async (req, res) => {
  console.log("CL base");
  res.json({ message: "CL base" });
});

// regresa los datos principales
router.get("/dashData", async (req, res) => {
  try {
    const userId = await getUserIdFromSession(req.headers["session-key"]);
    
    if (!userId || typeof userId !== "number") {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    // 1. Verify if user is a Capability Lead
    const user = await prisma.users.findUnique({
      where: { user_id: userId },
      include: { 
        Permits: true
      }
    });

    if (!user?.Permits?.is_capability_lead) {
      return res.status(403).json({ error: "User is not a Capability Lead" });
    }

    // 2. Get the capability the user leads
    const capability = await prisma.capability.findFirst({
      where: { capability_lead_id: userId },
      select: {
        capability_id: true,
        capability_name: true
      }
    });

    if (!capability) {
      return res.status(404).json({ error: "No capability found for this lead" });
    }

    const CLPosition = await prisma.employee_Position.findMany({
        where: { user_id: userId },
        select: {
            level: true,
            Work_Position: {
                select: {
                    position_name: true,
                }
            }
        }
    })

    // 3. Get all People Leads in this capability
    const peopleLeads = await prisma.capability_People_Lead.findMany({
      where: { capability_id: capability.capability_id },
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
                            position_name: true,
                        }
                    } 
                }
            }
          }
        }
      }
    });

    // 4. for every people lead get the count of users
    const peopleLeadsWithCounts = await Promise.all(
        peopleLeads.map(async (pl) => {
            const employeeCount = await prisma.capability_Employee.count({
            where: {
                people_lead_id: pl.capability_pl_id,
                capability_id: capability.capability_id
            }
            });
            return {
                ...pl,
                employeeCount
            };
        })
    );

    // 5. Format the response
    const response = {
        capabilityName: capability.capability_name,
        capabilityLeadName: user.name,
        capabilityLeadPos: CLPosition[CLPosition.length-1].Work_Position.position_name,
        capabilityLeadLevel: CLPosition[CLPosition.length-1].level,
        peopleLeads: peopleLeadsWithCounts.map(pl => ({
            id: pl.Users.user_id,
            name: pl.Users.name,
            employeeCount: pl.employeeCount,
            positionName: pl.Users.Employee_Position[pl.Users.Employee_Position.length-1].Work_Position.position_name,
            positionLevel: pl.Users.Employee_Position[pl.Users.Employee_Position.length-1].level
        }))
    };

    res.status(200).json(response);

  } catch (error) {
    console.error("Error in CL dashboard endpoint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// valida que en headers el sessionId sea del capability lead y usa un peopleLeadID que recibe para regresar datos de su region, correo y zona horaria
router.get("/plDetails", async (req, res) => {
  try {
    const userId = await getUserIdFromSession(req.headers["session-key"]);
    const { peopleLeadId } = req.query;

    //console.log(peopleLeadId);

    if (!userId || typeof userId !== "number") {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    if (!peopleLeadId || isNaN(Number(peopleLeadId))) {
      return res.status(400).json({ error: "Invalid peopleLeadId parameter" });
    }

    // 1. Verify if user is a Capability Lead
    const user = await prisma.users.findUnique({
      where: { user_id: userId },
      include: { Permits: true }
    });

    if (!user?.Permits?.is_capability_lead) {
      return res.status(403).json({ error: "User is not a Capability Lead" });
    }

    // 2. Get the capability the user leads
    const capability = await prisma.capability.findFirst({
      where: { capability_lead_id: userId }
    });

    if (!capability) {
      return res.status(404).json({ error: "No capability found for this lead" });
    }

    // 3. Verify the people lead belongs to this capability
    const peopleLead = await prisma.capability_People_Lead.findFirst({
      where: {
        capability_id: capability.capability_id,
        capability_pl_id: Number(peopleLeadId)
      },
      include: {
        Users: {
          include: {
            Country: true
          }
        }
      }
    });

    if (!peopleLead) {
      return res.status(404).json({ error: "People Lead not found in this capability" });
    }

    // 4. Format the response
    const response = {
      name: peopleLead.Users.name,
      email: peopleLead.Users.mail,
      region: peopleLead.Users.Country?.region_name,
      country: peopleLead.Users.Country?.country_name,
      timezone: peopleLead.Users.Country?.timezone
    };

    res.status(200).json(response);

  } catch (error) {
    console.error("Error in PL details endpoint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// valida que en headers el sessionId sea del capability lead y usa un peopleLeadID que recibe para regresar todos sus subordinados con nombre, nombre de work position y level
router.get("/subordinates", async (req, res) => {
  try {
    const userId = await getUserIdFromSession(req.headers["session-key"]);
    const { peopleLeadId } = req.query;

    if (!userId || typeof userId !== "number") {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    if (!peopleLeadId || isNaN(Number(peopleLeadId))) {
      return res.status(400).json({ error: "Invalid peopleLeadId parameter" });
    }

    // 1. Verify if user is a Capability Lead
    const user = await prisma.users.findUnique({
      where: { user_id: userId },
      include: { Permits: true }
    });

    if (!user?.Permits?.is_capability_lead) {
      return res.status(403).json({ error: "User is not a Capability Lead" });
    }

    // 2. Get the capability the user leads
    const capability = await prisma.capability.findFirst({
      where: { capability_lead_id: userId }
    });

    if (!capability) {
      return res.status(404).json({ error: "No capability found for this lead" });
    }

    // 3. Verify the people lead belongs to this capability and get subordinates
    const subordinates = await prisma.capability_Employee.findMany({
      where: {
        capability_id: capability.capability_id,
        people_lead_id: Number(peopleLeadId)
      },
      include: {
        Users_Capability_Employee_employee_idToUsers: {
          include: {
            Employee_Position: {
              include: {
                Work_Position: true
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

    // 4. Format the response
    const response = subordinates.map(sub => ({
      id: sub.employee_id,
      name: sub.Users_Capability_Employee_employee_idToUsers.name,
      position: sub.Users_Capability_Employee_employee_idToUsers.Employee_Position[0]?.Work_Position.position_name,
      level: sub.Users_Capability_Employee_employee_idToUsers.Employee_Position[0]?.level
    }));

    res.status(200).json(response);

  } catch (error) {
    console.error("Error in subordinates endpoint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Actualiza los people leads de los empleados
router.post("/updatePeopleLeads", async (req, res) => {
  try {
    const userId = await getUserIdFromSession(req.headers["session-key"]);
    const { changes }: { changes: Array<{ employeeId: number; newPeopleLeadId: number }> } = req.body;

    if (!userId || typeof userId !== "number") {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    // 1. Verify if user is a Capability Lead
    const user = await prisma.users.findUnique({
      where: { user_id: userId },
      include: { Permits: true }
    });

    if (!user?.Permits?.is_capability_lead) {
      return res.status(403).json({ error: "User is not a Capability Lead" });
    }

    // 2. Get the capability the user leads
    const capability = await prisma.capability.findFirst({
      where: { capability_lead_id: userId }
    });

    if (!capability) {
      return res.status(404).json({ error: "No capability found for this lead" });
    }

    // 3. Verify all new People Leads belong to this capability
    const newPeopleLeadIds = changes.map(c => c.newPeopleLeadId);
    const uniquePeopleLeadIds = [...new Set(newPeopleLeadIds)];
    
    const validPeopleLeads = await prisma.capability_People_Lead.findMany({
      where: {
        capability_id: capability.capability_id,
        capability_pl_id: { in: uniquePeopleLeadIds }
      }
    });

    if (validPeopleLeads.length !== uniquePeopleLeadIds.length) {
      return res.status(400).json({ error: "One or more People Leads don't belong to this capability" });
    }

    // 4. Process each change in a transaction
    const results = await prisma.$transaction(
      changes.map(change => 
        prisma.capability_Employee.updateMany({
          where: {
            capability_id: capability.capability_id,
            employee_id: change.employeeId
          },
          data: {
            people_lead_id: change.newPeopleLeadId
          }
        })
      )
    );

    // 5. Return success response
    res.status(200).json({ 
      message: "People Leads updated successfully",
      updatedCount: results.reduce((sum, r) => sum + r.count, 0)
    });

  } catch (error) {
    console.error("Error updating People Leads:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


export default router;