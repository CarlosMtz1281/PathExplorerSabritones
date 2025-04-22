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
  // lit
  return (
    <div>
      <div className="card w-80 bg-base-100 shadow-sm p-3">
        <div className="flex justify-between items-center w-full">
          <h2 className="text-2xl font-bold">Cargabilidad</h2>
          <div
            className="radial-progress text-primary border-primary"
            style={{ "--value": percentage ?? 0 } as React.CSSProperties}
            aria-valuenow={percentage ?? 0}
            role="progressbar"
          >
            {percentage !== null ? `${percentage}%` : "Cargando..."}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cargabilidad;
