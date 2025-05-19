// File: pathexplorer.js
import express from "express";
import dotenv from "dotenv";
import prisma from "../db/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const router = express.Router();

const CERTIFICATE_POINTS = 250;
const POSITION_POINTS_PER_MONTH = 250;

const gemma3 = {
  system_start: "<start_of_turn>system\n",
  system_end: "<end_of_turn>\n",
  system_instructions:
    "Genera recomendaciones de certificaciones y puestos laborales en español. Usa solo los IDs existentes y máximo 3 de cada tipo. Basado en:\n",
  system_instructions_empty:
    "El usuario no tiene experiencia en esta área. Genera recomendaciones básicas en español usando máximo 3 certificaciones y 3 puestos disponibles:\n",
  system_response_template:
    "SOLO JSON. Estructura requerida:\n" +
    `{
      "recommendations": {
        "introduction": "texto breve",
        "area": {
          "area_id": int,
          "previous_certificates": "texto breve",
          "previous_positions": "texto breve",
          "recommendations": {
            "certification": [{certificate_id, reason: "texto extendido", skills: array[string], recommendation_percentage, points: int}],
            "positions": [{position_id, reason: "texto extendido", skils: array[string], recommendation_percentage}]
          }
        }
      }
    }`,
  user_start: "<start_of_turn>user\n",
  user_end: "<end_of_turn>\n",
  model_start: "<start_of_turn>model\n",
  model_end: "<end_of_turn>\n",
};

async function enrichRecommendations(rawRecommendation: any, user_id?: number) {
  const areaId = rawRecommendation.recommendations.area.area_id;
  const certIds =
    rawRecommendation.recommendations.area.recommendations.certification.map(
      (c: any) => c.certificate_id
    );
  const positionIds =
    rawRecommendation.recommendations.area.recommendations.positions.map(
      (p: any) => p.position_id
    );

  const areaInfo = await prisma.areas.findUnique({
    where: { area_id: areaId },
    select: {
      area_name: true,
      area_desc: true,
    },
  });

  const certificateInfos = await prisma.certificates.findMany({
    where: { certificate_id: { in: certIds } },
    select: {
      certificate_id: true,
      certificate_name: true,
      certificate_desc: true,
    },
  });

  const positionInfos = await prisma.project_Positions.findMany({
    where: { position_id: { in: positionIds } },
    include: {
      Projects: {
        select: {
          start_date: true,
          end_date: true,
        },
      },
    },
  });

  const enrichedCerts =
    rawRecommendation.recommendations.area.recommendations.certification.map(
      (cert: any) => {
        const info = certificateInfos.find(
          (c) => c.certificate_id === cert.certificate_id
        );
        return { ...cert, ...info };
      }
    );

  const enrichedPositions =
    rawRecommendation.recommendations.area.recommendations.positions.map(
      (pos: any) => {
        const info = positionInfos.find(
          (p) => p.position_id === pos.position_id
        );
        const points = calculatePositionPoints(
          info.Projects.start_date,
          info.Projects.end_date
        );
        const infoWithPoints = {
          ...info,
          points: points,
        };

        return { ...pos, ...infoWithPoints };
      }
    );

  if (!user_id) {
    return {
      ...rawRecommendation,
      recommendations: {
        ...rawRecommendation.recommendations,
        area: {
          ...rawRecommendation.recommendations.area,
          area_name: areaInfo?.area_name || "",
          area_desc: areaInfo?.area_desc || "",
          recommendations: {
            certification: enrichedCerts,
            positions: enrichedPositions,
          },
          user_area_score: 0,
          top_percentage: 0,
        },
      },
    };
  }

  const getAreasUsers = await prisma.user_Area_Score.findMany({
    where: { area_id: areaId },
    orderBy: { score: "desc" },
  });

  const userAreaScore = getAreasUsers.find((area) => area.user_id === user_id);

  const percentage =
    Math.round(
      (1 -
        (getAreasUsers.length - getAreasUsers.indexOf(userAreaScore)) /
          getAreasUsers.length) *
        1000
    ) / 10;

  const top_percentage = percentage > 0 ? percentage : 0.1;

  return {
    ...rawRecommendation,
    recommendations: {
      ...rawRecommendation.recommendations,
      area: {
        ...rawRecommendation.recommendations.area,
        area_name: areaInfo?.area_name || "",
        area_desc: areaInfo?.area_desc || "",
        recommendations: {
          certification: enrichedCerts,
          positions: enrichedPositions,
        },
        user_top_percentage: top_percentage,
        user_points: userAreaScore?.score || 0,
      },
    },
  };
}

const getTimeBetweenInDays = (
  start_date: Date,
  end_date: Date | null
): number => {
  const start = new Date(start_date);
  const end = end_date ? new Date(end_date) : new Date();

  const diffMs = end.getTime() - start.getTime();

  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return diffDays;
};

const calculatePositionPoints = (
  start_date: Date,
  end_date: Date | null
): number => {
  const start = new Date(start_date);
  const end = end_date ? new Date(end_date) : new Date();

  const diffMs = end.getTime() - start.getTime();

  const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30);

  return diffMonths * POSITION_POINTS_PER_MONTH;
};

const getUserAreas = async (user_id: number) => {
  const areas = await prisma.user_Area_Score.findMany({
    where: { user_id },
    orderBy: { score: "desc" },
    take: 3,
    include: {
      Areas: {
        select: {
          area_name: true,
          area_desc: true,
        },
      },
    },
  });

  return areas;
};

const getUserCertifications = async (user_id: number) => {
  const certifications = await prisma.certificate_Users.findMany({
    where: { user_id },
    select: {
      Certificates: {
        include: {
          Certificate_Skills: {
            include: {
              Skills: true,
            },
          },
          Area_Certificates: {
            include: {
              Areas: true,
            },
          },
        },
      },
    },
  });

  return certifications;
};

const getUserPositions = async (user_id: number) => {
  const positions = await prisma.project_Positions.findMany({
    where: { user_id },
    select: {
      position_id: true,
      position_name: true,
      position_desc: true,
      Project_Position_Skills: {
        include: {
          Skills: true,
        },
      },
      Project_Position_Areas: {
        include: {
          Areas: true,
        },
      },
    },
  });

  return positions;
};

const getAllCertificates = async () => {
  const certificates = await prisma.certificates.findMany({
    include: {
      Certificate_Skills: {
        include: {
          Skills: true,
        },
      },
      Area_Certificates: {
        include: {
          Areas: true,
        },
      },
    },
  });

  return certificates;
};

const getAllPositions = async () => {
  const positions = await prisma.project_Positions.findMany({
    where: { user_id: null },
    include: {
      Project_Position_Skills: {
        include: {
          Skills: true,
        },
      },
      Project_Position_Areas: {
        include: {
          Areas: true,
        },
      },
      Projects: true,
    },
  });

  return positions;
};

router.get("/", async (req, res) => {
  console.log("PathExplorer base");
  res.json({ message: "PathExplorer base" });
});

router.post("/update-position-area-scores", async (req, res) => {
  try {
    const today = new Date();

    const positions = await prisma.employee_Position.findMany({
      where: {
        start_date: { lte: today },
        OR: [{ end_date: null }, { end_date: { gte: today } }],
      },
    });

    const DAILY_POINTS = POSITION_POINTS_PER_MONTH / 30;

    for (const pos of positions) {
      const { user_id, position_id } = pos;

      const areas = await prisma.project_Position_Areas.findMany({
        where: { position_id },
      });

      for (const area of areas) {
        await prisma.user_Area_Score.upsert({
          where: {
            user_id_area_id: { user_id, area_id: area.area_id },
          },
          update: {
            score: { increment: DAILY_POINTS },
          },
          create: {
            user_id,
            area_id: area.area_id,
            score: DAILY_POINTS,
          },
        });
      }
    }

    res.json({
      message: "User area scores incremented for active positions.",
    });
  } catch (error) {
    console.error("Error updating position area scores:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/get-top-areas/:user_id", async (req, res) => {
  try {
    const user_id = parseInt(req.params.user_id);
    const areas = await getUserAreas(user_id);

    const formattedResponse = areas.map((area) => ({
      area_id: area.area_id,
      score: area.score,
      area_name: area.Areas.area_name,
      area_desc: area.Areas.area_desc,
    }));

    if (areas.length === 0) {
      return res.status(404).json({ error: "No areas found for user" });
    }

    res.json(formattedResponse);
  } catch (error) {
    console.error("Error fetching top areas:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/get-recommendation/:user_id/:area_id", async (req, res) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemma-3-12b-it",
      generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
    });

    const all_positions = await getAllPositions();
    const all_certificates = await getAllCertificates();
    const all_areas = await prisma.areas.findMany({
      select: {
        area_id: true,
        area_name: true,
        area_desc: true,
      },
    });

    const context = {
      all_areas: all_areas.map((area) => ({
        area_id: area.area_id,
        area_name: area.area_name,
      })),
      all_certificates: all_certificates.map((cert) => ({
        certificate_id: cert.certificate_id,
        name: cert.certificate_name,
        description: cert.certificate_desc,
        provider: cert.provider,
        //difficulty: cert.difficulty,
        //estimated_time: cert.estimated_time,
        skills: cert.Certificate_Skills.map((skill) => ({
          skill_name: skill.Skills.name,
        })),
        areas: cert.Area_Certificates.map((area) => ({
          area_name: area.Areas.area_name,
          area_desc: area.Areas.area_desc,
        })),
        points: CERTIFICATE_POINTS,
      })),
      all_positions: all_positions.map((pos) => ({
        position_id: pos.position_id,
        name: pos.position_name,
        description: pos.position_desc,
        skills: pos.Project_Position_Skills.map((skill) => ({
          skill_name: skill.Skills.name,
        })),
        areas: pos.Project_Position_Areas.map((area) => ({
          area_name: area.Areas.area_name,
          area_desc: area.Areas.area_desc,
        })),
        start_date: pos.Projects.start_date,
        end_date: pos.Projects.end_date,
        durationDays: getTimeBetweenInDays(
          pos.Projects.start_date,
          pos.Projects.end_date
        ),
        points: calculatePositionPoints(
          pos.Projects.start_date,
          pos.Projects.end_date
        ),
      })),
    };

    const user_id = parseInt(req.params.user_id);
    const areas = await getUserAreas(user_id);

    const selectedArea = areas.find(
      (area) => area.area_id === parseInt(req.params.area_id)
    );

    if (!selectedArea) {
      const prompt =
        gemma3.system_start +
        gemma3.system_instructions_empty +
        JSON.stringify(context) +
        gemma3.system_response_template +
        gemma3.system_end +
        gemma3.user_start +
        JSON.stringify({ user_id, area_id: req.params.area_id }) +
        gemma3.user_end;

      const result = await model.generateContent(prompt);
      const responseText =
        result.response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!responseText) {
        return res.status(500).json({ error: "Empty response from AI model" });
      }
      try {
        const cleanedJson = responseText
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

        const sanitizedJson = cleanedJson.replace(/,\s*([\]}])/g, "$1");
        const parsedResponse = JSON.parse(sanitizedJson);

        const recommendations = await enrichRecommendations(parsedResponse);

        return res.json(recommendations);
      } catch (parseError) {
        console.error("Error parsing JSON response:", parseError);
        return res.status(500).json({
          error: "Failed to parse AI response",
          originalResponse: responseText,
        });
      }
    }

    const certifications = await getUserCertifications(user_id);
    const positions = await getUserPositions(user_id);

    const userInfo = {
      user_info: {
        user_id: user_id,
        certifications: certifications.map((cert) => ({
          certificate_id: cert.Certificates.certificate_id,
          name: cert.Certificates.certificate_name,
          description: cert.Certificates.certificate_desc,
          provider: cert.Certificates.provider,
          //difficulty: cert.Certificates.difficulty,
          //estimated_time: cert.Certificates.estimated_time,
          skills: cert.Certificates.Certificate_Skills.map((skill) => ({
            skill_name: skill.Skills.name,
          })),
          areas: cert.Certificates.Area_Certificates.map((area) => ({
            area_name: area.Areas.area_name,
            area_desc: area.Areas.area_desc,
          })),
        })),
        positions: positions.map((pos) => ({
          position_id: pos.position_id,
          name: pos.position_name,
          description: pos.position_desc,
          skills: pos.Project_Position_Skills.map((skill) => ({
            skill_name: skill.Skills.name,
          })),
          areas: pos.Project_Position_Areas.map((area) => ({
            area_name: area.Areas.area_name,
            area_desc: area.Areas.area_desc,
          })),
        })),
        area_expertize: {
          area_id: selectedArea.area_id,
          area_name: selectedArea.Areas.area_name,
          area_desc: selectedArea.Areas.area_desc,
          score: selectedArea.score,
        },
      },
    };

    const allInfo = {
      userInfo,
      context,
    };

    const prompt =
      gemma3.system_start +
      gemma3.system_instructions +
      JSON.stringify(allInfo) +
      gemma3.system_response_template +
      gemma3.system_end +
      gemma3.user_start +
      JSON.stringify(userInfo) +
      gemma3.user_end;

    const result = await model.generateContent(prompt);

    const responseText =
      result.response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      return res.status(500).json({ error: "Empty response from AI model" });
    }

    try {
      const cleanedJson = responseText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const sanitizedJson = cleanedJson.replace(/,\s*([\]}])/g, "$1");

      const parsedResponse = JSON.parse(sanitizedJson);

      const recommendations = await enrichRecommendations(
        parsedResponse,
        userInfo.user_info.user_id
      );

      return res.json(recommendations);
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      return res.status(500).json({
        error: "Failed to parse AI response",
        originalResponse: responseText,
      });
    }
  } catch (error) {
    console.error("Error fetching top areas:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
