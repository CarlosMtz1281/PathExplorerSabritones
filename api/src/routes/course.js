// File: course.js
const express = require("express");
const prisma = require("../db/prisma"); // ← CommonJS version
// ← CommonJS version

const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();

router.get("/", async (req, res) => {
  console.log("Ccourse base");
  res.json({ message: "Course base" });
});

module.exports = router;
