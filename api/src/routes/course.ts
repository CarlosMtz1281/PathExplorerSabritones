// File: course.js
import express from "express";
import dotenv from "dotenv";
import prisma from "../db/prisma";
import { getUserIdFromSession, updateSession } from "../utils/session";
import multer from "multer";
import path from "path";
import fs from "fs";

dotenv.config();

const uploadDir = path.join(__dirname, '../../uploads/certificates');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

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
      certificate_start_date: certificate.certificate_start_date,
      certificate_expiration_date: certificate.certificate_expiration_date,
      certificate_link: certificate.certificate_link,
      certificate_uri: certificate.certificate_uri, // <-- Added so frontend can access the PDF
      certificate_status: certificate.status,
      certificate_hours: certificate.Certificates.certificate_estimated_time,
      certificate_level: certificate.Certificates.certificate_level,
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
      certificate_uri: certificate.certificate_uri, // <-- Added so frontend can access the PDF
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

router.post("/add-certificate", upload.single('pdf'), async (req, res) => {
  const sessionKey = req.headers["session-key"];
  const {
    certificate_id,
    certificate_date,
    certificate_expiration_date,
    certificate_link,
    certificate_status,
  } = req.body;

  // Handle uploaded file
  let certificateUri = null;
  if (req.file) {
    // Save relative path to the file for access from the client
    certificateUri = `/uploads/certificates/${req.file.filename}`;
  }

  if (!sessionKey) {
    return res
      .status(400)
      .json({ error: "Session key is required in headers" });
  }

  if (!certificate_id || !certificate_date || !certificate_status) {
    return res
      .status(400)
      .json({ error: "Certificate ID, date, and status are required" });
  }

  try {
    // Validate session and get user ID
    const userId = await getUserIdFromSession(sessionKey);
    if (!userId) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    // Update session expiration
    await updateSession(sessionKey);

    // Check if the user already has the certification
    const existingCertificate = await prisma.certificate_Users.findFirst({
      where: {
        user_id: Number(userId),
        certificate_id: Number(certificate_id),
      },
    });

    if (existingCertificate) {
      return res
        .status(400)
        .json({ error: "User already has this certification" });
    }

    // Add the certificate for the user
    const newCertificate = await prisma.certificate_Users.create({
      data: {
        user_id: Number(userId),
        certificate_id: Number(certificate_id),
        status: certificate_status,
        certificate_date: new Date(certificate_date),
        certificate_expiration_date: certificate_expiration_date
          ? new Date(certificate_expiration_date)
          : null,
        certificate_link: certificate_link || null,
        certificate_uri: certificateUri,
      },
    });

    res.status(201).json({
      message: "Certificate added successfully",
      certificate: newCertificate,
    });
  } catch (error) {
    console.error("Error adding certificate:", error);
    res.status(500).json({ error: "Failed to add certificate" });
  }
});

export default router;
