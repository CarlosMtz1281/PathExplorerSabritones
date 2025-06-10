import React, { useState, useEffect, act } from "react";
import { FaLock } from "react-icons/fa";
import { useSession } from "next-auth/react";
import axios from "axios";
import Image from "next/image";
import { a } from "framer-motion/client";

interface AreaRecommendation {
  area: {
    area_desc: string;
    area_id: number;
    area_name: string;
    previous_certificates: string;
    previous_positions: string;
    recommendations: {
      certification: {
        certificate_id: number;
        reason: string;
        skills: string[];
        recommendation_percentage: number;
        points: number;
      }[];
      positions: {
        position_id: number;
        position_name: string;
        reason: string;
        recommendation_percentage: number;
      }[];
    };
    user_points: string;
    user_top_percentage: number;
  };
  introduction: string;
}

const ModalPathExplorer = ({ onClose }: { onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = [
    { area_id: 1, area_name: "BackEnd", logo: "/badges/backend.svg" },
    { area_id: 2, area_name: "Frontend", logo: "/badges/frontend.svg" },
    { area_id: 3, area_name: "Cloud & DevOps", logo: "/badges/cloud.svg" },
    {
      area_id: 4,
      area_name: "Data Science & Analytics",
      logo: "/badges/dataScience.svg",
    },
    { area_id: 5, area_name: "Mobile", logo: "/badges/mobile.svg" },
    { area_id: 6, area_name: "Quality Assurance", logo: "/badges/qa.svg" },
    { area_id: 7, area_name: "UX/UI", logo: "/badges/uiux.svg" },
    { area_id: 8, area_name: "Project Management", logo: "/badges/pm.svg" },
    {
      area_id: 9,
      area_name: "Cybersecurity",
      logo: "/badges/cybersecurity.svg",
    },
    { area_id: 10, area_name: "Database Engineering", logo: "/badges/db.svg" },
  ];

  const [activeTabData, setActiveTabData] = useState<AreaRecommendation>(null); // Store data for the active tab
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    console.log(          `${process.env.NEXT_PUBLIC_API_BASE}/path-explorer/get-recommendation/${activeTab}`); // Log the API URL for debugging
    const fetchActiveTabData = async () => {
      if (tabs.length === 0) return;

      setLoading(true);
      try {
        const response = await axios.get(
          
          `${process.env.NEXT_PUBLIC_API_BASE}/path-explorer/get-recommendation/${activeTab}`,
          {
            headers: {
              Authorization: session?.sessionId, // Replace with actual session ID
            },
          }
        );
        setActiveTabData(response.data.recommendations);
        console.log("Active Tab Data:", response.data.recommendations);
      } catch (error) {
        console.error("Error fetching active tab data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveTabData();
  }, [activeTab]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function calculateLevel(points: number): number {
    if (points < 240) return 1;
    if (points < 740) return 2;
    if (points < 1700) return 3;
    if (points < 4300) return 4;
    else return 5;
  }

  function getLevelPercentage(points: number): number {
    const levels = [
      { min: 0, max: 240 },
      { min: 240, max: 740 },
      { min: 740, max: 1700 },
      { min: 1700, max: 4300 },
      { min: 4300, max: Infinity },
    ];

    for (let i = 0; i < levels.length; i++) {
      const { min, max } = levels[i];
      if (points >= min && points < max) {
        return Math.round(((points - min) / (max - min)) * 100);
      }
    }

    return 0; // Default fallback
  }

  console.log("Active Tab:", activeTab);

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-base-100 rounded-lg shadow-lg w-5/6 md:w-4/5 lg:w-3/4 p-8 relative h-5/6">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Modal Header */}
        <h2 className="text-2xl font-bold mb-6">Áreas de Expertise</h2>

        {/* Tabs */}
        <div className="flex overflow-x-auto overflow-y-hidden">
          {tabs.map((tab, index) => (
            <button
              key={tab.area_id}
              onClick={() => setActiveTab(tab.area_id)} // Change tab on click
              className={`flex-1 text-sm font-bold py-2 px-4 transition-transform duration-200 flex items-center justify-center ${
                activeTab === tab.area_id
                  ? "bg-primary text-white scale-105"
                  : "bg-accent text-primary hover:bg-primary hover:text-white hover:scale-105"
              } ${
                index === 0
                  ? "rounded-tl-lg"
                  : index === tabs.length - 1
                  ? "rounded-tr-lg"
                  : ""
              }`}
            >
              <Image
                src={tab.logo}
                alt={tab.area_name}
                width={24}
                height={24}
                className="mr-2"
              />
              {activeTab === tab.area_id && <span>{tab.area_name}</span>}
            </button>
          ))}
        </div>

        {/* Content Section */}
        <div className="w-full bg-base-300 rounded-lg p-4 h-[65vh] overflow-y-auto">
          {loading ? (
            <div className="col-span-3 flex justify-center items-center">
              <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 rounded-full text-primary"></div>
            </div>
          ) : activeTabData ? (
            <div className="w-full">
              {/* container  */}
              <div className="w-full h-full">
                {/* header */}
                <div className="flex w-full gap-4 mb-4">
                  {/* Left Column (40%) */}
                  <div className="flex flex-col basis-4/10">
                    <div className="flex items-center ">
                      <div className="avatar">
                        <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 flex items-center justify-center p-2">
                          <Image
                            src={tabs[activeTab]?.logo}
                            alt="Logo"
                            width={100}
                            height={100}
                            className="object-cover w-20 h-20"
                          />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl font-bold mt-4">
                          {activeTabData.area.area_name}
                        </h3>
                        <p className="text-gray-500">
                          {activeTabData.area.user_points} puntos de expertise
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column (40%) */}
                  <div className="flex flex-col basis-4/10">
                    <h4 className="text-lg font-bold mb-2">
                      Nivel{" "}
                      {calculateLevel(Number(activeTabData.area.user_points))}
                    </h4>
                    <div className="flex items-center gap-2 w-full">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-primary h-2.5 rounded-full"
                          style={{
                            width: `${
                              getLevelPercentage(
                                Number(activeTabData.area.user_points)
                              ) ?? 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-sm font-semibold">
                        {getLevelPercentage(
                          Number(activeTabData.area.user_points)
                        ) !== null
                          ? `${getLevelPercentage(
                              Number(activeTabData.area.user_points)
                            )}%`
                          : "Cargando..."}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {activeTabData.area.user_points} puntos para alcanzar el
                      siguiente nivel
                    </p>
                  </div>

                  {/* Right Column (20%) */}
                  <div className="flex flex-col basis-2/10 items-center">
                    <h4 className="text-center">Top</h4>
                    <div className="rounded-full bg-accent w-16 h-16 flex items-center justify-center">
                      <p className="text-sm font-bold">
                        {activeTabData.area.user_top_percentage}%
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 text-center mt-2">
                      Empleados en esta área
                    </p>
                  </div>
                </div>

                {/* middle Section */}
                <div className="flex">
                  <div>
                    <h4 className="text-lg font-bold mb-2">
                      Resumen de tu carrera
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">
                      {activeTabData.introduction}
                    </p>

                    <p className="text-sm text-gray-500 mb-4">
                      {activeTabData.area.previous_certificates}
                    </p>

                    <p className="text-sm text-gray-500 mb-4">
                      {activeTabData.area.previous_positions}
                    </p>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-bold mb-2">
                      Habilidades relacionadas
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {activeTabData.area.recommendations.certification[0]
                        ?.skills?.length > 0 ? (
                        activeTabData.area.recommendations.certification[0].skills.map(
                          (skill, index) => (
                            <span
                              key={index}
                              className="badge badge-outline badge-primary text-sm"
                            >
                              {skill}
                            </span>
                          )
                        )
                      ) : (
                        <p className="text-gray-500">
                          No hay habilidades relacionadas.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/*BOTTOM */}
                <div className="col-span-1">
                  <h4 className="text-lg font-bold mb-2">
                    Certificaciones recomendadas
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {activeTabData.area.recommendations?.certification?.length >
                    0 ? (
                      activeTabData.area.recommendations.certification.map(
                        (cert, index) => (
                          <div
                            key={index}
                            className="bg-gray-100 p-4 rounded-lg"
                          >
                            <h5 className="font-bold">
                              {cert.skills.join(", ")}
                            </h5>
                            <p className="text-sm text-gray-500">
                              Certificación
                            </p>
                            <p className="text-sm font-bold">
                              {cert.points} puntos
                            </p>
                            <p className="text-sm text-gray-500">
                              {cert.reason}
                            </p>
                          </div>
                        )
                      )
                    ) : (
                      <p className="text-gray-500">
                        No hay certificaciones recomendadas.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Section */}
            </div>
          ) : (
            <div className="col-span-3 text-center">
              <p className="text-gray-500">No hay datos disponibles.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalPathExplorer;
