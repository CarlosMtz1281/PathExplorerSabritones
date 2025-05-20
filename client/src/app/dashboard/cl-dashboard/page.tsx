"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface CapabilityLeadData {
  capabilityName: string;
  capabilityLeadName: string;
  capabilityLeadPos: string;
  capabilityLeadLevel: string;
  peopleLeads: {
    id: number;
    name: string;
    employeeCount: number;
    positionName: string;
    positionLevel: string;
  }[];
}

// Componente principal del dashboard
const DashboardCL = () => {
    const { data: session } = useSession();
    const [dashboardData, setDashboardData] = useState<CapabilityLeadData | null>(null);

    const fetchData = async () => {
        try {
            const sessionId = session?.sessionId;
            if (!sessionId) {
                console.error("Session ID is missing");
                return;
            }

            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/cl/dashData`, {
                headers: { "session-key": sessionId },
            });

            if (res.status === 401) {
                console.error("Session expired or invalid. Redirecting to login...");
                localStorage.removeItem("sessionId"); 
                window.location.href = "/login"; 
                return;
            }

            setDashboardData(res.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [session]);

    // Calculate total subordinates (sum of all people leads' employees)
    const totalSubordinates = dashboardData?.peopleLeads.reduce(
        (total, pl) => total + pl.employeeCount, 0
    ) || 0;

    // Función para dividir los People Leads en grupos de 3 para las filas
    const chunkArray = (array: any[], size: number) => {
        const result = [];
        for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
        }
        return result;
    };

    const peopleLeadsChunks = dashboardData ? chunkArray(dashboardData.peopleLeads, 3) : [];

  return (
    <div className="flex flex-col min-h-screen bg-base-200 px-22 py-10">
        {/*  Título de la pantalla */}
        <div className="flex w-full items-center bg-base-100 p-5 text-4xl font-bold rounded-md border border-base-300 mb-6">
            <p>Tu Capability</p>
        </div>
        {/* Capability */}
        <div className="flex w-full flex-1 flex-col bg-base-100 p-5 rounded-md border border-base-300">
                <h2 className="text-3xl font-bold mb-4 text-secondary">{dashboardData?.capabilityName}</h2>
                <div className="w-[40%] h-px bg-base-300"></div>

                {/* Datos */}
                {dashboardData && (
                 <div className="flex flex-col w-full bg-base-200 rounded-2xl border border-base-300 mt-4 shadow-sm overflow-y-auto" 
                     style={{ maxHeight: '63vh' }}>
                    {/* Capability Lead Card - Now full width */}
                    <div className="w-full pt-6">
                        <div className="flex w-[45%] items-center bg-base-100 p-5 rounded-2xl border border-base-300 mb-6 shadow-md mx-auto">
                            {/* Imagen */}
                            <div className="avatar mr-4">
                                <div className="w-24 h-24 rounded-lg">
                                    <Image
                                        width={96}
                                        height={96}
                                        src="/profilePhoto.jpg"
                                        alt={`Foto de ${dashboardData.capabilityLeadName}`}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            </div>
                            {/* Capability Lead Info */}
                            <div className="flex-grow">                            
                                <h3 className="text-2xl font-bold mb-1">
                                    {dashboardData.capabilityLeadName}
                                </h3>
                                
                                <p className="text-lg text-gray-600 mb-2">
                                    {dashboardData.capabilityLeadPos} {dashboardData.capabilityLeadLevel}
                                </p>
                                
                                <div className="flex space-x-6 text-sm">
                                    <div>
                                    <p className="font-semibold">Subordinados Directos</p>
                                    <p className="text-gray-600">
                                        {dashboardData.peopleLeads.length} People Leads
                                    </p>
                                    </div>
                                    <div>
                                    <p className="font-semibold">Totales</p>
                                    <p className="text-gray-600">
                                        {totalSubordinates+dashboardData.peopleLeads.length} Empleados
                                    </p>
                                    </div>
                                    <div className="flex items-center mx-auto">
                                        <span className="bg-secondary text-primary-content px-3 py-1 rounded-full text-xs font-semibold mr-3">
                                        Capability Lead
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    

                    {/* People Leads Section - Now properly below */}
                    <div className="w-full mt-6">                        
                        {peopleLeadsChunks.map((chunk, chunkIndex) => (
                            <div key={chunkIndex} className="flex justify-center gap-10 mb-10">
                                {chunk.map((peopleLead) => (
                                    <div key={peopleLead.id} className="flex w-[29%] items-center bg-base-100 p-2 rounded-2xl border border-base-300 shadow-md">
                                        {/* Imagen */}
                                        <div className="avatar mr-4 ml-2">
                                            <div className="w-20 h-20 rounded-lg">
                                                <Image
                                                    width={80}
                                                    height={80}
                                                    src="/profilePhoto.jpg"
                                                    alt={`Foto de ${peopleLead.name}`}
                                                    className="object-cover w-full h-full"
                                                />
                                            </div>
                                        </div>
                                        {/* People Lead Info */}
                                        <div className="flex-grow">                            
                                            <h3 className="text-xl font-bold mb-1">
                                                {peopleLead.name}
                                            </h3>
                                            
                                            <p className="text-md text-gray-600 mb-2">
                                                {peopleLead.positionName} {peopleLead.positionLevel}
                                            </p>
                                            
                                            <div className="flex space-x-4 text-sm">
                                                <div>
                                                    <p className="font-semibold">Subordinados</p>
                                                    <p className="text-gray-600">
                                                        {peopleLead.employeeCount} Empleados
                                                    </p>
                                                </div>
                                                <div className="flex items-center ml-auto">
                                                    <span className="bg-accent px-3 py-1 rounded-full text-xs font-semibold">
                                                        People Lead
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
                )}
        </div>
    </div>
  );
};

export default DashboardCL;