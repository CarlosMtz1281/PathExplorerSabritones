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
    return res
      .status(400)
      .json({ error: "Session key is required in headers" });
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

    // Fetch certificates for the user, including associated skills
    const certificates = await prisma.certificate_Users.findMany({
      where: { user_id: Number(userId) },
      include: {
        Certificates: {
          include: {
            Certificate_Skills: {
              include: {
                Skills: true, // Join with the Skills table
              },
            },
          },
        },
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
      provider: certificate.Certificates.provider, // Fetch the provider
      skills: certificate.Certificates.Certificate_Skills.map(
        (skill) => skill.Skills.name
      ), // Extract skill names
    }));

    res.json(formattedCertificates);
  } catch (error) {
    console.error("Error fetching certificates:", error);
    res.status(500).json({ error: "Failed to fetch certificates" });
  }
});

router.get("/getCertificatesByUserId/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  try {
    // Validate session and get user ID

    // Fetch certificates for the user, including associated skills
    const certificates = await prisma.certificate_Users.findMany({
      where: { user_id: Number(userId) },
      include: {
        Certificates: {
          include: {
            Certificate_Skills: {
              include: {
                Skills: true, // Join with the Skills table
              },
            },
          },
        },
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
      provider: certificate.Certificates.provider, // Fetch the provider
      skills: certificate.Certificates.Certificate_Skills.map(
        (skill) => skill.Skills.name
      ), // Extract skill names
    }));

    res.json(formattedCertificates);
  } catch (error) {
    console.error("Error fetching certificates:", error);
    res.status(500).json({ error: "Failed to fetch certificates" });
  }
});
router.get("/providers-and-certifications", async (req, res) => {
  try {
    // Fetch all unique providers from the Certificates table
    const providers = await prisma.certificates.findMany({
      distinct: ["provider"],
      select: { provider: true },
    });

    // Fetch all certifications with their corresponding skills and full details
    const certifications = await prisma.certificates.findMany({
      include: {
        Certificate_Skills: {
          include: {
            Skills: true, // Join with the Skills table to fetch skill details
          },
        },
      },
    });

    // Format the certifications to include skills as an array of skill names
    const formattedCertifications = certifications.map((cert) => ({
      certificate_id: cert.certificate_id,
      certificate_name: cert.certificate_name,
      certificate_desc: cert.certificate_desc,
      provider: cert.provider,
      skills: cert.Certificate_Skills.map((skill) => skill.Skills.name), // Extract skill names
    }));

    res.json({
      providers: providers.map((provider) => provider.provider),
      certifications: formattedCertifications,
    });
  } catch (error) {
    console.error("Error fetching providers and certifications:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch providers and certifications" });
  }
});

export default router;
