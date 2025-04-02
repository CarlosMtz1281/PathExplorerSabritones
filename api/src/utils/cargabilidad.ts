import prisma from "../db/prisma";


async function getCargabilidad(userId: number) {
  const results = await prisma.$queryRaw`
    SELECT
      u."user_id",
      u."name",
      -- Casteamos el intervalo a texto para que Prisma no falle
      SUM(COALESCE(p."end_date", NOW()) - p."start_date")::text AS "total_time_in_projects",
      (
        u."hire_date" 
        - SUM(COALESCE(p."end_date", NOW()) - p."start_date")
      )::date AS "adjusted_hire_date"
    FROM "Users" u
    JOIN "Project_User" pu
      ON u."user_id" = pu."user_id"
    JOIN "Projects" p
      ON pu."project_id" = p."project_id"
    WHERE u."user_id" = ${userId}
    GROUP BY u."user_id", u."name", u."hire_date";
  `;

  return results[0] ?? null;
}

// module.exports = getCargabilidad;
export default getCargabilidad;