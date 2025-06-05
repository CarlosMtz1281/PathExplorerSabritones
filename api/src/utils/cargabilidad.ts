import prisma from "../db/prisma";

// async function getCargabilidad(userId: number) {
//   const result = await prisma.$queryRaw<any[]>`
//     SELECT
//       -- Calculamos el porcentaje de días en proyectos
//       (DATE_PART('day', SUM(COALESCE(p."end_date", NOW()) - p."start_date")) 
//       / DATE_PART('day', NOW() - u."hire_date")) * 100 AS "percentage_in_projects"
//     FROM "Users" u
//     JOIN "Project_Positions" pp ON u."user_id" = pp."user_id"
//     JOIN "Projects" p ON pp."project_id" = p."project_id"
//     WHERE u."user_id" = ${userId}::integer
//     GROUP BY u."user_id", u."hire_date"`;
//   const rawPercentage = result[0]?.percentage_in_projects;
//   return rawPercentage !== undefined ? Math.round(rawPercentage) : 0;
// }

async function getCargabilidad(userId: number) {
  userId = parseInt(userId.toString(), 10);
  // Primero obtenemos el rol del usuario
  const user = await prisma.users.findUnique({
    where: { user_id: userId },
    select: { hire_date: true, role_id: true },
  });

  if (!user || !user.hire_date) return 0;

  let result;

  if (user.role_id === 4) {
    // Delivery lead: usamos los proyectos donde el usuario es delivery_lead_user_id
    result = await prisma.$queryRaw<any[]>`
      SELECT
        (DATE_PART('day', SUM(COALESCE(p."end_date", NOW()) - p."start_date")) 
        / DATE_PART('day', NOW() - ${user.hire_date})) * 100 AS "percentage_in_projects"
      FROM "Projects" p
      WHERE p."delivery_lead_user_id" = ${userId}::integer
      GROUP BY p."delivery_lead_user_id"
    `;
  } else {
    // Cualquier otro usuario: usamos sus Project_Positions
    result = await prisma.$queryRaw<any[]>`
      SELECT
        (DATE_PART('day', SUM(COALESCE(p."end_date", NOW()) - p."start_date")) 
        / DATE_PART('day', NOW() - ${user.hire_date})) * 100 AS "percentage_in_projects"
      FROM "Users" u
      JOIN "Project_Positions" pp ON u."user_id" = pp."user_id"
      JOIN "Projects" p ON pp."project_id" = p."project_id"
      WHERE u."user_id" = ${userId}::integer
      GROUP BY u."user_id"
    `;
  }

  const rawPercentage = result[0]?.percentage_in_projects;
  return rawPercentage !== undefined ? Math.round(rawPercentage) : 0;
}

export default getCargabilidad;