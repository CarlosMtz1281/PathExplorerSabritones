"use client";
import React, { useEffect, useState } from "react";

const Cargabilidad = ({ userId }: { userId: number }) => {
  const [percentage, setPercentage] = useState<number | null>(null);

  useEffect(() => {
    const fetchCargabilidad = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/general/cargabilidad?userId=${userId}`
        );
        const data = await res.json();
        console.log(data);
        setPercentage(Math.round(data));
      } catch (error) {
        console.error("Error fetching cargabilidad:", error);
      }
    };

    fetchCargabilidad();
  }, [userId]);

  return (
       <div className="flex flex-col gap-2 w-full">
      {/* Title */}
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold">Cargabilidad</h2>
        <span
          className="tooltip tooltip-bottom"
          data-tip="Porcentaje de carga actual"
        >
          <i className="text-gray-500 text-sm">ⓘ</i>
        </span>
      </div>
    
      {/* Progress Bar */}
      <div className="flex items-center gap-2 w-full">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-primary h-2.5 rounded-full"
            style={{ width: `${percentage ?? 0}%` }}
          ></div>
        </div>
        <p className="text-sm font-semibold">{percentage !== null ? `${percentage}%` : "Cargando..."}</p>
      </div>
    </div>
  );
};

export default Cargabilidad;