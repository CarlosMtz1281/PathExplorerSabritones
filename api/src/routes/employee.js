// File: employee.js
const express = require("express");

const prisma = require("../db/prisma"); // ← CommonJS version

const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();

router.get("/", async (req, res) => {
  console.log("Employee base");
  res.json({ message: "Employee base" });
});

module.exports = router;
