import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";

//badges
import cybersecurity from "@/../public/badges/cybersecurity.svg";

const WidgetPathExplorer = () => {
  interface Path {
    area_id: number;
    area_name: string;
    area_desc: string;
    score: string;
  }

  const [paths, setPaths] = useState<Path[]>([]);
  const { data: session } = useSession();

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
          console.error("Unexpected API response format:", data);
          setPaths([]);
        }
      } catch (error) {
        console.error("Error fetching paths:", error);
        setPaths([]);
      }
    };

    fetchPaths();
  }, []);

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
              <div>
                <div className="w-16 h-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 flex items-center justify-center">
                  <Image
                    width={30}
                    height={30}
                    src={cybersecurity}
                    alt="Path Badge"
                    className="object-cover w-10 h-10 rounded-full"
                  />
                </div>
              </div>

              {/* Path Info */}
              <div>
                <h3 className="text-lg font-semibold">{path.area_name || "Sin nombre"}</h3>
                <p className="text-sm text-gray-500">
                  {path.score !== undefined ? path.score.toLocaleString() : "0"} pts
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WidgetPathExplorer;
