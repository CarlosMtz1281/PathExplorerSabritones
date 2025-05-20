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

export default router;