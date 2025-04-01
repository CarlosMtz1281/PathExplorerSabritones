// File: course.js
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");

dotenv.config();

const prisma = new PrismaClient();
const router = express.Router();

router.get("/", async (req, res) => {
    console.log("Ccourse base");
    res.json({ message: "Course base" });
});

module.exports = router;
