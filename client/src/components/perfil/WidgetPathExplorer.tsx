import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import ModalPathExplorer from "./ModalPathExplorer";

// Chart.js imports
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const WidgetPathExplorer = () => {
  interface Path {
    area_id: number;
    area_name: string;
    area_desc: string;
    score: string;
  }
  interface AreaScore {
    area_id: number;
    area_name: string;
    area_desc: string;
    score: number | string;
  }

  const [paths, setPaths] = useState<Path[]>([]);
  const { data: session } = useSession();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [allAreaScores, setAllAreaScores] = useState<AreaScore[]>([]);

  const areas = [
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

  useEffect(() => {
    const fetchPaths = async () => {
      try {
        const axios = (await import("axios")).default;
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE}/path-explorer/get-top-areas`,
          {
            headers: { authorization: session?.sessionId },
          }
        );
        const data = res.data;
        if (Array.isArray(data)) {
          setPaths(data);
        } else {
          setPaths([]);
        }
      } catch (error) {
        setPaths([]);
      }
    };

    const fetchAllAreaScores = async () => {
      try {
        const axios = (await import("axios")).default;
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE}/path-explorer/get-all-area-scores`,
          {
            headers: { authorization: session?.sessionId },
          }
        );
        const data = res.data;
        setAllAreaScores(data);
      } catch (error) {
        setAllAreaScores([]);
      }
    };

    fetchAllAreaScores();
    fetchPaths();
  }, [session?.sessionId]);

  // ...existing code...

  // Custom plugin to draw images as point labels
  const iconLabelsPlugin = {
    id: "iconLabels",
    afterDraw: (chart: any) => {
      const { ctx, scales } = chart;
      const scale = scales.r;
      if (!scale) return;

      const centerX = scale.xCenter;
      const centerY = scale.yCenter;
      // Move icons closer to the chart (reduce overflow)
      const outerRadius = scale.drawingArea * 0.85; // 15% closer
      const labelCount = allAreaScores.length;

      allAreaScores.forEach((area, i) => {
        const angle = Math.PI / 2 - (2 * Math.PI * i) / labelCount;
        const x = centerX + Math.cos(angle) * (outerRadius + 35);
        const y = centerY - Math.sin(angle) * (outerRadius + 35);

        const logo = getAreaLogo(area.area_id);
        const img = new window.Image();
        img.src = logo;
        // Draw image when loaded
        img.onload = () => {
          ctx.save();
          ctx.beginPath();
          ctx.arc(x, y, 18, 0, 2 * Math.PI);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(img, x - 15, y - 15, 30, 30);
          ctx.restore();
        };
        // If already loaded, draw immediately
        if (img.complete) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(x, y, 18, 0, 2 * Math.PI);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(img, x - 15, y - 15, 30, 30);
          ctx.restore();
        }
      });
    },
  };

  // Radar chart options: hide point label text
const radarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      top: 40,
      bottom: 40,
      left: 40,
      right: 40,
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context: any) =>
          `${context.dataset.label}: ${context.formattedValue} pts`,
      },
    },
  },
  scales: {
    r: {
      angleLines: { display: true },
      suggestedMin: 0,
      suggestedMax: 2500,
      pointLabels: {
        display: false,
      },
      ticks: {
        color: "#6B7280",
        stepSize: 500,
        backdropColor: "transparent", // prevent overlapping backgrounds
      },
    },
  },
};

  // Radar chart data
  const radarData = {
    labels: allAreaScores.map((area) => area.area_name),
    datasets: [
      {
        label: "Puntaje",
        data: allAreaScores.map((area) =>
          typeof area.score === "string" ? parseFloat(area.score) : area.score
        ),
        backgroundColor: "rgba(188, 56, 228, 0.15)", // lighter purple fill
        borderColor: "#BC38E4", // light purple line
        pointBackgroundColor: "#BC38E4", // light purple points
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#BC38E4", // light purple highlight
      },
    ],
  };

  const getAreaLogo = (area_id: number) => {
    const found = areas.find((a) => a.area_id === area_id);
    return found ? found.logo : "/badges/default.svg";
  };

  return (
    <div className="card bg-base-100 shadow-lg p-6 rounded-lg w-full">
      {/* Header */}
      <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
        <span className="text-primary">
          <Image
            width={24}
            height={24}
            src="/pathExplorer.svg"
            alt="Path Explorer Icon"
            className="w-10 h-10"
          />
        </span>
        Path Explorer
      </h2>

      

      {/* Path Items */}
      <div className="flex flex-col gap-10 mt-5">
        {paths.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-primary"></div>
            <p className="text-gray-500">Cargando rutas...</p>
          </div>
        ) : (
          paths.map((path, index) => (
            <div key={index} className="flex items-center gap-4 rounded-lg ">
              {/* Badge */}
              <div className="">
                <div className="w-16 h-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 flex items-center justify-center">
                  <Image
                    width={30}
                    height={30}
                    src={getAreaLogo(path.area_id)}
                    alt="Path Badge"
                    className="object-cover w-10 h-10 rounded-full"
                  />
                </div>
              </div>
              {/* Path Info */}
              <div>
                <h3 className="text-lg font-semibold">
                  {path.area_name || "Sin nombre"}
                </h3>
                <p className="text-sm text-gray-500">
                  {path.score !== undefined ? path.score.toLocaleString() : "0"}{" "}
                  pts
                </p>
              </div>
            </div>
          ))
        )}

        {/* Radar Chart */}
      <div className="w-full flex justify-center mb-8">
        {allAreaScores.length > 0 ? (
          <div className="w-full max-w-xl relative" style={{ height: "18rem" }}>
            <Radar
              data={radarData}
              options={radarOptions}
              plugins={[iconLabelsPlugin]}
            />
          </div>
        ) : (
          <div className="text-center text-gray-400">Cargando gráfico...</div>
        )}
      </div>
      </div>
      <div className="mt-6"></div>
      {/* View More Button */}
      <button
        className="btn btn-outline btn-primary mt-6 w-full"
        onClick={() => setModalIsOpen(true)}
      >
        Ver Más
      </button>
      {modalIsOpen && (
        <ModalPathExplorer onClose={() => setModalIsOpen(false)} />
      )}
    </div>
  );
};

export default WidgetPathExplorer;
