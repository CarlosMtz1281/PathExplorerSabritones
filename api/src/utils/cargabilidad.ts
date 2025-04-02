import prisma from "../db/prisma.js";

interface AggregatedProjectTime {
  user_id: number;
  name: string | null;
  total_time_in_projects: string | null; // Typically an interval string
  adjusted_hire_date: Date | null; // Typically a Date
}

async function getCargabilidad(userId: number) {
  const results = await prisma.$queryRaw<AggregatedProjectTime[]>`
      SELECT
        u."user_id",
        u."name",
        -- Sum the intervals for each project
        SUM(COALESCE(p."end_date", NOW()) - p."start_date") AS "total_time_in_projects",
        (
          u."hire_date" 
          - SUM(COALESCE(p."end_date", NOW()) - p."start_date")
        ) AS "adjusted_hire_date"
      FROM "Users" u
      JOIN "Project_User" pu
        ON u."user_id" = pu."user_id"
      JOIN "Projects" p
        ON pu."project_id" = p."project_id"
      WHERE u."user_id" = ${userId}
      GROUP BY u."user_id", u."name", u."hire_date";
    `;

  // Probably only one row in "results", or null if no projects
  return results[0] ?? null;
}

module.exports = getCargabilidad;
