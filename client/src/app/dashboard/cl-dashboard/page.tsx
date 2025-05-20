"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
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

interface PeopleLeadDetails {
  name: string;
  email: string;
  region: string;
  country: string;
  timezone: string;
}

interface Subordinate {
  id: number;
  name: string;
  position: string;
  level: string;
  currentPeopleLeadId?: number;
}

const DashboardCL = () => {
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = useState<CapabilityLeadData | null>(null);
  const [selectedPeopleLead, setSelectedPeopleLead] = useState<number | null>(null);
  const [peopleLeadDetails, setPeopleLeadDetails] = useState<PeopleLeadDetails | null>(null);
  const [subordinates, setSubordinates] = useState<Subordinate[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [employeeChanges, setEmployeeChanges] = useState<Record<number, number>>({});

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

  const openPeopleLeadModal = async (peopleLeadId: number) => {
    setIsLoading(true);
    setIsModalOpen(true);
    setSelectedPeopleLead(peopleLeadId);
    setEmployeeChanges({});
    
    try {
        const sessionId = session?.sessionId;
        if (!sessionId) return;

        // Fetch People Lead details
        const detailsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/cl/plDetails`, {
        headers: { "session-key": sessionId },
        params: { peopleLeadId }
        });

        // Fetch subordinates
        const subordinatesRes = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/cl/subordinates`, {
        headers: { "session-key": sessionId },
        params: { peopleLeadId }
        });

        setPeopleLeadDetails(detailsRes.data);

        // Add current people lead ID to each subordinate
        setSubordinates(subordinatesRes.data.map((sub: Subordinate) => ({
        ...sub,
        currentPeopleLeadId: peopleLeadId
        })));
    } catch (error) {
        console.error("Error fetching People Lead details:", error);
    } finally {
        setIsLoading(false);
    }
    };

  const handlePeopleLeadChange = (employeeId: number, newPeopleLeadId: number) => {
    setEmployeeChanges(prev => ({
      ...prev,
      [employeeId]: newPeopleLeadId
    }));
  };

  const saveChanges = async () => {
    try {
        setIsLoading(true);
        const sessionId = session?.sessionId;
        if (!sessionId) return;

        // Prepare the data to send
        const changesToSend = Object.entries(employeeChanges).map(([employeeId, newPeopleLeadId]) => ({
            employeeId: Number(employeeId),
            newPeopleLeadId
        }));
        
        await axios.post(`${process.env.NEXT_PUBLIC_API_BASE}/cl/updatePeopleLeads`, {
        changes: changesToSend,
        }, {
        headers: { "session-key": sessionId }
        });

        setIsModalOpen(false);
        fetchData();
    } catch (error) {
        console.error("Error saving changes:", error);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [session]);

  const totalSubordinates = dashboardData?.peopleLeads.reduce(
    (total, pl) => total + pl.employeeCount, 0
  ) || 0;

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
      {/* Título de la pantalla */}
      <div className="flex w-full items-center bg-base-100 p-5 text-4xl font-bold rounded-md border border-base-300 mb-6">
        <p>Tu Capability</p>
      </div>
      
      {/* Capability */}
      <div className="flex w-full flex-1 flex-col bg-base-100 p-5 rounded-md border border-base-300">
        <h2 className="text-3xl font-bold mb-4 text-secondary">{dashboardData?.capabilityName}</h2>
        <div className="w-[40%] h-px bg-base-300"></div>

        {/* Datos */}
        {dashboardData && (
          <div 
            className="flex flex-col w-full bg-base-200 rounded-2xl border border-base-300 mt-4 shadow-sm overflow-y-auto" 
            style={{ maxHeight: '63vh' }}
          >
            {/* Capability Lead Card */}
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
                        {totalSubordinates + dashboardData.peopleLeads.length} Empleados
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

            {/* People Leads Section */}
            <div className="w-full mt-6">                        
              {peopleLeadsChunks.map((chunk, chunkIndex) => (
                <div key={chunkIndex} className="flex justify-center gap-10 mb-10">
                  {chunk.map((peopleLead) => (
                    <div 
                      key={peopleLead.id} 
                      className="flex w-[29%] items-center bg-base-100 p-2 rounded-2xl border border-base-300 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => openPeopleLeadModal(peopleLead.id)}
                    >
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-2xl w-full max-w-5xl h-[75vh] overflow-hidden">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  Subordinados de {peopleLeadDetails?.name || "People Lead"}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-circle btn-sm"
                >
                  ✕
                </button>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row gap-6 px-6">
                  {/* Left Side - People Lead Details */}
                  <div className="w-full md:w-1/3 bg-base-100 py-6 px-3 rounded-xl border-2 border-base-300 relative shadow-lg overflow-hidden">
                    {/* Banner Background */}
                    <div className="absolute top-0 left-0 w-full h-30">
                      <Image
                        src="/banner.jpg"
                        alt="Banner background"
                        layout="fill"
                        objectFit="cover"
                        className="opacity-90"
                      />
                    </div>
                    
                    <div className="relative z-10 mt-6">
                      <div className="flex flex-col items-center mb-4">
                        <div className="avatar mb-4">
                          <div className="w-40 h-40 rounded-full border-4 border-white">
                            <Image
                              width={128}
                              height={128}
                              src="/profilePhoto.jpg"
                              alt={`Foto de ${peopleLeadDetails?.name}`}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-center">
                          {peopleLeadDetails?.name}
                        </h3>
                        <p className="text-primary text-center text-lg font-bold">
                          {dashboardData?.peopleLeads.find(pl => pl.id === selectedPeopleLead)?.positionName} {dashboardData?.peopleLeads.find(pl => pl.id === selectedPeopleLead)?.positionLevel}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <div>
                          <p className="text-lg text-center mt-2">
                            {peopleLeadDetails?.country}, {peopleLeadDetails?.region} 🌎
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-center mt-6">
                            {peopleLeadDetails?.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-center">
                            Zona Horaria: {peopleLeadDetails?.timezone}
                          </p>
                        </div>
                        <div>
                          <p className="text-primary text-center text-lg font-semibold mt-8">
                            {subordinates.length} Subordinados
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Subordinates List */}
                  <div className="w-full md:w-2/3">
                    <div className="grid grid-cols-1 md:grid-cols-1 max-h-[52vh] gap-4 mb-6 bg-base-200 p-6 overflow-y-auto rounded-2xl">
                      {subordinates.map((subordinate: Subordinate) => (
                        <div 
                          key={subordinate.id} 
                          className="bg-base-100 p-4 rounded-lg border border-base-300 flex justify-between items-center"
                        >
                          <div className="flex items-center">
                            <div className="avatar mr-5 pl-1">
                              <div className="w-16 h-16 rounded-lg">
                                <Image
                                  width={96}
                                  height={96}
                                  src="/profilePhoto.jpg"
                                  alt={`Foto de ${subordinate.name}`}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                            </div>
                            <div>
                              <h4 className="font-bold text-lg">{subordinate.name}</h4>
                              <p className="text-sm text-gray-600">
                                {subordinate.position} {subordinate.level}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <p className="text-md font-semibold mb-1 text-secondary mr-2">People Lead:</p>
                            <select 
                              className="select select-bordered select-sm w-full max-w-xs bg-accent/20 text-accent-content hover:bg-accent/30 focus:bg-accent/30 transition-colors"
                              defaultValue={subordinate.currentPeopleLeadId}
                              onChange={(e) => handlePeopleLeadChange(subordinate.id, Number(e.target.value))}
                            >
                              {dashboardData?.peopleLeads.map((pl) => (
                                <option key={pl.id} value={pl.id}>
                                  {pl.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Button at the bottom */}
                    <div className="flex justify-end gap-4">
                      <button 
                        className="btn btn-ghost"
                        onClick={() => setIsModalOpen(false)}
                      >
                        Cancelar
                      </button>
                      <button 
                        className="btn btn-primary"
                        onClick={saveChanges}
                        disabled={Object.keys(employeeChanges).length === 0}
                      >
                        Guardar Cambios
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardCL;