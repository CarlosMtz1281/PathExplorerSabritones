// File: pl.ts
import express from "express";
import dotenv from "dotenv";
import prisma from "../db/prisma";
import { getUserIdFromSession } from "../utils/session";
import getCargabilidad from "../utils/cargabilidad";

dotenv.config();

const router = express.Router();

router.get("/", async (req, res) => {
  console.log("PL base");
  res.json({ message: "PL base" });
});

router.get("/dashData", async (req, res) => {
    try {
        const userId = await getUserIdFromSession(req.headers["session-key"]);
        
        if (!userId || typeof userId !== "number") {
            return res.status(401).json({ error: "Invalid or expired session" });
        }

        // 1. Verify if user is a People Lead
        const user = await prisma.users.findUnique({
            where: { user_id: userId },
            include: { 
                Permits: true  // Changed from 'role' to 'Permits' to match your schema
            }
        });

        if (!user?.Permits?.is_people_lead) {
            return res.status(403).json({ error: "User is not a People Lead" });
        }

        const subordinados = await getSubordinados(userId);
        
        const cargabilidadProm = await calcCargabilidadProm(subordinados);

        const timelineCerts = await getCerts(subordinados);

        const alertas = await getAlertas(subordinados);

        const dataSubordinados = await getDataSub(subordinados);


        res.status(200).json({
            subordinados,
            cargabilidadProm,
            timelineCerts,
            alertas,
            dataSubordinados
        });

    } catch (error) {
        console.error("Error in PL dashboard endpoint:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Funcion 1 > recibir ids de subordinados del PL (select employee_id from capability_employee where people_lead_id = userId)
async function getSubordinados(userId: number) {
    const subordinados = await prisma.capability_Employee.findMany({
        where: { people_lead_id: userId },
        select: {
            employee_id: true
        },
    });
    return subordinados;
}

// Funcion 2 > usar IDs de subordinados para calcular la cargabilidad promedio
async function calcCargabilidadProm(subordinados: any[]) {
    const subordinadosIds = subordinados.map((sub) => sub.employee_id);

    const cargabilidadPromises = subordinadosIds.map(async (id) => {
        const cargabilidad = await getCargabilidad(id);
        return cargabilidad;
    });

    const cargabilidadResults = await Promise.all(cargabilidadPromises);
    const totalCargabilidad = cargabilidadResults.reduce((acc, curr) => acc + curr, 0);
    const cargabilidadProm = Math.round(totalCargabilidad / cargabilidadResults.length);

    return cargabilidadProm;
}

// Funcion 3 > recibir todas las certificaciones completadas por los subordinados en los ultimos 12 meses (regresar como una matriz de subordinadosx13 donde cada arreglo este primero el id del subordinado y en los otros 12 la cantidad de certificados completados por mes, si puede haber 0) (se usa el certificate_date de la tabla Certificate_Users)
async function getCerts(subordinados: any[]) {
    const subordinadosIds = subordinados.map((sub) => sub.employee_id);
    
    // First get all certificates in the last 12 months
    const certificates = await prisma.certificate_Users.findMany({
        where: {
            user_id: { in: subordinadosIds },
            certificate_date: {
                gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
            },
        },
        select: {
            user_id: true,
            certificate_date: true,
            Certificates: {
                select: {
                    certificate_name: true
                }
            },
            Users: {
                select: {
                    name: true
                }
            }
        },
        orderBy: {
            certificate_date: 'desc'
        }
    });

    // Group by month
    const timelineData = subordinadosIds.map(employeeId => {
        const employeeCerts = certificates.filter(cert => cert.user_id === employeeId);
        const employeeName = employeeCerts[0]?.Users?.name || 'Unknown';
        
        // Initialize array with 12 months (current month + 11 previous)
        const monthlyCounts = Array(12).fill(0);
        
        employeeCerts.forEach(cert => {
            if (cert.certificate_date) {
                const certDate = new Date(cert.certificate_date);
                const monthDiff = (new Date().getMonth() - certDate.getMonth()) + 
                                 (12 * (new Date().getFullYear() - certDate.getFullYear()));
                
                if (monthDiff >= 0 && monthDiff < 12) {
                    monthlyCounts[11 - monthDiff]++; // Reverse order (oldest first)
                }
            }
        });

        return {
            employeeId,
            employeeName,
            monthlyCounts
        };
    });

    return timelineData;
}

// Funcion 4 > recibir todas las alertas de los subordinados (quiero que se regrese un arreglo de objetos donde cada objeto tenga el id del subordinado, el tipo de alerta y la fecha de la alerta)
// los tipos de alerta son:
// 1. feedback reciente de proyecto (usar la fecha de finalizacion del proyecto)
// 2. certificaciones recientes (usar la fecha de certificacion)
// 3. metas registradas (usar la fecha de registro de la meta)
async function getAlertas(subordinados: any[]) {
    const subordinadosIds = subordinados.map((sub) => sub.employee_id);
    
    // Get all alerts from different sources
    const [projectFeedbacks, recentCerts, goals] = await Promise.all([
        // 1. Feedback reciente de proyecto
        prisma.project_Positions.findMany({
            where: {
                user_id: { in: subordinadosIds },
                Projects: {
                    end_date: {
                        gte: new Date(new Date().setMonth(new Date().getMonth() - 3)),
                    }
                },
                Feedback: {
                    some: {}
                }
            },
            select: {
                user_id: true,
                Users: {
                    select: {
                        name: true
                    }
                },
                Projects: {
                    select: {
                        end_date: true,
                        project_name: true
                    }
                },
                Feedback: {
                    select: {
                        score: true,
                        desc: true
                    }
                }
            }
        }),

        // 2. Certificaciones recientes (ahora incluye el nombre del usuario)
        prisma.certificate_Users.findMany({
            where: {
                user_id: { in: subordinadosIds },
                certificate_date: {
                    gte: new Date(new Date().setMonth(new Date().getMonth() - 3))
                },
                status: 'completed'
            },
            select: {
                user_id: true,
                certificate_date: true,
                Users: {
                    select: {
                        name: true
                    }
                },
                Certificates: {
                    select: {
                        certificate_name: true
                    }
                }
            },
            orderBy: {
                certificate_date: 'desc'
            }
        }),
        
        // 3. Metas registradas (ahora incluye el nombre del usuario)
        prisma.goal_Users.findMany({
            where: {
                user_id: { in: subordinadosIds },
                create_date: {
                    gte: new Date(new Date().setMonth(new Date().getMonth() - 3))
                }
            },
            select: {
                user_id: true,
                create_date: true,
                Users: {
                    select: {
                        name: true
                    }
                },
                Goals: {
                    select: {
                        goal_name: true
                    }
                }
            },
            orderBy: {
                create_date: 'desc'
            }
        })
    ]);

    // Format all alerts into a unified structure
    const alerts = [];
    
    // Process project feedbacks
    projectFeedbacks.forEach(feedback => {
        alerts.push({
            userId: feedback.user_id,
            userName: feedback.Users?.name || 'Desconocido',
            type: 'project_feedback',
            date: feedback.Projects?.end_date,
            details: {
                projectName: feedback.Projects?.project_name,
                score: feedback.Feedback?.[0]?.score,
                comment: feedback.Feedback?.[0]?.desc
            }
        });
    });


    
    // Process recent certifications
    recentCerts.forEach(cert => {
        alerts.push({
            userId: cert.user_id,
            userName: cert.Users?.name || 'Desconocido',
            type: 'recent_certification',
            date: cert.certificate_date,
            details: {
                certificateName: cert.Certificates?.certificate_name
            }
        });
    });
    
    // Process registered goals
    goals.forEach(goal => {
        alerts.push({
            userId: goal.user_id,
            userName: goal.Users?.name || 'Desconocido',
            type: 'registered_goal',
            date: goal.create_date,
            details: {
                goalName: goal.Goals?.goal_name
            }
        });
    });

    // Sort all alerts by date (newest first)
    alerts.sort((a, b) => {
        if (!a.date || !b.date) return 0;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return alerts;
}


// Funcion 5 > regresar los datos de los subordinados a partir de id (id, nombre, posicion, cargabilidad)
async function getDataSub(subordinados: any[]) {
    const subordinadosIds = subordinados.map((sub) => sub.employee_id);

    // Obtener información de usuarios incluyendo sus posiciones actuales
    const usersWithPositions = await prisma.users.findMany({
        where: { user_id: { in: subordinadosIds } },
        include: {
            Employee_Position: {
                where: {
                    end_date: null, // Posición actual (sin fecha de fin)
                },
                include: {
                    Work_Position: true // Incluir información del puesto de trabajo
                },
                take: 1 // Solo tomar la posición más reciente si hay múltiples
            }
        }
    });

    // Obtener cargabilidad para cada usuario
    const cargabilidadPromises = usersWithPositions.map(async (user) => {
        const cargabilidad = await getCargabilidad(user.user_id);
        return isNaN(cargabilidad) ? 0 : cargabilidad;
    });
    const cargabilidadResults = await Promise.all(cargabilidadPromises);

    // Formatear los datos de salida
    const dataSubordinados = usersWithPositions.map((user, index) => {
        const currentPosition = user.Employee_Position[0]?.Work_Position;
        
        return {
            id: user.user_id,
            nombre: user.name,
            posicion: currentPosition?.position_name || 'Sin posición asignada',
            cargabilidad: cargabilidadResults[index] || 0
        };
    });

    return dataSubordinados;
}

export default router;