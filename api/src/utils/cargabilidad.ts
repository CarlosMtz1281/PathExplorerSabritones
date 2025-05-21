import prisma from "../db/prisma";

async function getCargabilidad(userId: number) {
  const result = await prisma.$queryRaw<any[]>`
    SELECT
      -- Calculamos el porcentaje de días en proyectos
      (DATE_PART('day', SUM(COALESCE(p."end_date", NOW()) - p."start_date")) 
      / DATE_PART('day', NOW() - u."hire_date")) * 100 AS "percentage_in_projects"
    FROM "Users" u
    JOIN "Project_Positions" pp ON u."user_id" = pp."user_id"
    JOIN "Projects" p ON pp."project_id" = p."project_id"
    WHERE u."user_id" = ${userId}::integer
    GROUP BY u."user_id", u."hire_date"`;
  const rawPercentage = result[0]?.percentage_in_projects;
  return rawPercentage !== undefined ? Math.round(rawPercentage) : 0;
}

export default getCargabilidad;