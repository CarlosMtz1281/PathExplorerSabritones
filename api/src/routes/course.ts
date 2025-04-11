// File: course.js
import express from "express";
import dotenv from "dotenv";
import prisma from "../db/prisma";
import { getUserIdFromSession, updateSession } from "../utils/session";


dotenv.config();

const router = express.Router();

router.get("/", async (req, res) => {
  console.log("ourse base");
  res.json({ message: "Course base" });
});

router.get("/certificates", async (req, res) => {
  const sessionKey = req.headers["session-key"];

  if (!sessionKey) {
    return res.status(400).json({ error: "Session key is required in headers" });
  }
  console.log("Session key:", sessionKey); // Debugging: Log the session key
  try {
    // Validate session and get user ID
    
    const userId = await getUserIdFromSession(sessionKey);
    console.log("User ID from session:", userId);
    if (!userId) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    
    // Update session expiration
    await updateSession(sessionKey);

    // Fetch certificates for the user
    const certificates = await prisma.certificate_Users.findMany({
      where: { user_id: Number(userId) },
      include: {
        Certificates: true, // Join with the Certificates table
      },
    });

    const formattedCertificates = certificates.map((certificate) => ({
      certificate_id: certificate.certificate_id,
      user_id: certificate.user_id,
      certificate_name: certificate.Certificates.certificate_name,
      certificate_desc: certificate.Certificates.certificate_desc,
      certificate_date: certificate.certificate_date,
      certificate_expiration_date: certificate.certificate_expiration_date,
      certificate_link: certificate.certificate_link,
    }));

    res.json(formattedCertificates);
  } catch (error) {
    console.error("Error fetching certificates:", error);
    res.status(500).json({ error: "Failed to fetch certificates" });
  }
});

export default router;
