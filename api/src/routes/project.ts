// File: poject.js
import express from "express";
import dotenv from "dotenv";
import prisma from "../db/prisma.js";

dotenv.config();

const router = express.Router();

router.get("/", async (req, res) => {
  console.log("Projects base");
  res.json({ message: "Projects base" });
});

export default router;
