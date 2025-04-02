// File: course.js
import express from "express";
import dotenv from "dotenv";
import prisma from "../db/prisma.js";

dotenv.config();

const router = express.Router();

router.get("/", async (req, res) => {
  console.log("ourse base");
  res.json({ message: "Course base" });
});

export default router;
