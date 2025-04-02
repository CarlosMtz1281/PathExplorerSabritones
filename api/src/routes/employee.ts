// File: employee.js
import express from "express";
import dotenv from "dotenv";
import prisma from "../db/prisma.js";

dotenv.config();

const router = express.Router();

router.get("/", async (req, res) => {
  console.log("Employee base");
  res.json({ message: "Employee base" });
});

export default router;
