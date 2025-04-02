// File: user.js
import express from "express";
import dotenv from "dotenv";
import prisma from "../db/prisma";
dotenv.config();

const router = express.Router();

async function getCargabilidad(userId) {
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

// Get all users
router.get("/", async (req, res) => {
  const users = await prisma.users.findMany(); // Use `user` instead of `users`
  res.json(users);
});

// Validate user login and returns userID
router.post("/login", async (req, res) => {
  const { mail, password } = req.body;
  const user = await prisma.users.findUnique({
    where: { mail } as any,
  });
  if (user && user.password === password) {
    const user_id = user.user_id.toString();
    res.json({ success: true, id: user.user_id });
  } else {
    res.json({ success: false });
  }
});

// Add a new user
router.post("/register", async (req, res) => {
  try {
    const { name, mail, password, birthday } = req.body;

    // Convert birthday string to a Date object
    const formattedBirthday = new Date(birthday);

    if (isNaN(formattedBirthday.getTime())) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid date format" });
    }

    const user = await prisma.users.create({
      data: { name, mail, password, birthday: formattedBirthday } as any,
    });

    res.json({ success: true, id: user.user_id.toString() });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/cargabilidad", async (req, res) => {
  const userId = parseInt(req.query.userId);

  if (isNaN(userId)) {
    return res.status(400).json({ error: "Invalid or missing userId" });
  }

  try {
    const result = await getCargabilidad(userId);
    if (!result) {
      return res.status(404).json({ message: "No data found for user" });
    }
    res.json(result);
  } catch (error) {
    console.error("Error getting cargabilidad:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
