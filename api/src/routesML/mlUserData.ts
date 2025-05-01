// File: mlUserData.ts
import express from "express";
import dotenv from "dotenv";
import prisma from "../db/prisma";

dotenv.config();

const router = express.Router();

router.get("/", async (req, res) => {
  console.log("ML User Data base");
  res.json({ message: "ML User Data base" });
});

// skills of specific user without session key, in params
router.get("/skills/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const skills = await prisma.user_Skills.findMany({
      where: { user_id: Number(user_id) },
      include: {
        Skills: true,
      },
    });

    const formattedSkills = {
      skills_id: [...new Set(skills.flatMap((skill) => skill.Skills.skill_id))],
    };

    res.status(200).json(formattedSkills);
  } catch (error) {
    console.error("Error fetching skills:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// certificates of specific user without session key, in params
router.get("/certificates/:user_id", async (req, res) => {
  const { user_id } = req.params;
  try {
    const certificates = await prisma.certificate_Users.findMany({
      where: { user_id: Number(user_id) },
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

    // Format the response to include only the skills IDs from all certificates
    const formattedCertificates = {
      certificate_id: certificates.map((c) => c.certificate_id), // Keep IDs as array
      skills_id: certificates.flatMap((certificate) =>
        certificate.Certificates.Certificate_Skills.map(
          (skill) => skill.Skills.skill_id
        )
      ),
    };

    res.status(200).json(formattedCertificates);
  } catch (error) {
    console.error("Error fetching certificates:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// courses of specific user without session key, in params
router.get("/courses/:user_id", async (req, res) => {
  const { user_id } = req.params;
  try {
    const courses = await prisma.course_Users.findMany({
      where: { user_id: Number(user_id) },
      include: {
        Courses: {
          include: {
            Course_Skills: {
              include: {
                Skills: true, // Join with the Skills table
              },
            },
          },
        },
      },
    });

    const formattedCourses = {
      skills_id: courses.flatMap((course) =>
        course.Courses.Course_Skills.map((skill) => skill.Skills.skill_id)
      ),
    };

    res.status(200).json(formattedCourses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// skills of the  positions of specific user without session key, in params
router.get("/positions/:user_id", async (req, res) => {
  const { user_id } = req.params;
  try {
    const positions = await prisma.project_Positions.findMany({
      where: { user_id: Number(user_id) },
      include: {
        Project_Position_Skills: {
          include: {
            Skills: true,
          },
        },
      },
    });

    const formattedPositions = {
      skills_id: positions.flatMap((position) =>
        position.Project_Position_Skills.map((skill) => skill.Skills.skill_id)
      ),
    };

    res.status(200).json(formattedPositions);
  } catch (error) {
    console.error("Error fetching positions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// goals of specific user without session key, in params
router.get("/goals/:user_id", async (req, res) => {
  const { user_id } = req.params;
  try {
    const goals = await prisma.goal_Users.findMany({
      where: { user_id: Number(user_id) },
      include: {
        Goals: true,
      },
    });

    const formattedGoals = goals.map((goal) => ({
      goal_id: goal.goal_id,
      goal_name: goal.Goals.goal_name,
      goal_desc: goal.Goals.goal_desc,
    }));

    res.status(200).json(formattedGoals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
