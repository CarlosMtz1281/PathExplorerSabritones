// File: employee.js
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");

dotenv.config();

const prisma = new PrismaClient();
const router = express.Router();

router.get("/", async (req, res) => {
    console.log("Employee base");
    res.json({ message: "Employee base" });
});

module.exports = router;
