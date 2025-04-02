// File: user.js
const prisma = require("../db/prisma"); // ← CommonJS version
const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const router = express.Router();

// Get all users
router.get("/", async (req, res) => {
  const users = await prisma.users.findMany(); // Use `user` instead of `users`
  res.json(users);
});

// Validate user login and returns userID
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.users.findUnique({
    where: { email },
  });
  if (user && user.password === password) {
    user.id = user.id.toString();
    res.json({ success: true, id: user.id });
  } else {
    res.json({ success: false });
  }
});

// Add a new user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, birthday } = req.body;

    // Convert birthday string to a Date object
    const formattedBirthday = new Date(birthday);

    if (isNaN(formattedBirthday.getTime())) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid date format" });
    }

    const user = await prisma.users.create({
      data: { name, email, password, birthday: formattedBirthday },
    });

    res.json({ success: true, id: user.id.toString() });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("cargabilidad", async (req, res) => {});
module.exports = router;
