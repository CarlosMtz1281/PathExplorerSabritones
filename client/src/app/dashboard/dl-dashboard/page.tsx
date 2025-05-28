"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import axios from "axios";


interface Project {
  projectId: number;
  projectName: string;
  companyName: string;
  description?: string;
  startDate: string | Date;
  endDate: string | Date;
  country?: string;
  region?: string;
  openPositions: ProjectPosition[];
}

interface ProjectPosition {
  positionId: number;
  positionName: string;
  description?: string;
  capability?: string;
  areas: {
    areaId: number;
    areaName: string;
  }[];
}

interface Postulation {
  postulationId: number;
  postulationDate: string | Date;
  project: {
    projectId: number;
    projectName: string;
  };
  position: {
    positionId: number;
    positionName: string;
    capability?: string;
  };
  user: {
    userId: number;
    name: string;
    position?: string;
    level?: number;
  };
  meetings: Meeting[];
}

interface Meeting {
  meetingId: number;
  meetingDate?: string | Date;
  meetingLink?: string;
}

// Componente principal del dashboard
const DashboardDL = () => {
    const { data: session } = useSession();
    const [projects, setProjects] = useState<Project[]>([]);
    const [postulations, setPostulations] = useState<Postulation[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isFuturProjModalOpen, setIsFuturProjModalOpen] = useState(false);

    const fetchData = async () => {
        try {
            const sessionId = session?.sessionId;
            if (!sessionId) {
                console.error("Session ID is missing");
                return;
            }

            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/dl/dataFuturo`, {
                headers: { "session-key": sessionId },
            });

            if (res.status === 401) {
                console.error("Session expired or invalid. Redirecting to login...");
                localStorage.removeItem("sessionId"); 
                window.location.href = "/login"; 
                return;
            }

            const data = res.data;
            console.log("Fetched data:", data);
            setProjects(data.projects || []);
            setPostulations(data.postulations || []);
            
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [session]);

    const openProjectDetails = (project: Project) => {
        setSelectedProject(project);
        setIsFuturProjModalOpen(true);
    };

    const closeModal = () => {
        setIsFuturProjModalOpen(false);
        setSelectedProject(null);
    };

    return (
        <div className="flex flex-col h-full bg-base-200 px-22 py-10">
            {/* Título de la pantalla */}
            <div className="flex w-full items-center bg-base-100 p-5 text-4xl font-bold rounded-md border border-base-300 mb-6 text-secondary">
                <p>Dashboard Delivery Lead</p>
            </div>

            {/* Futuros Proy */}
            <div className="flex w-full bg-base-100 p-5 rounded-md border border-base-300 mb-6">
                <div className="w-full">
                    <h2 className="text-3xl font-bold mb-4">Futuros Proyectos</h2>
                    <div className="w-full h-px bg-base-300 mb-4"></div>

                    <div className="flex flex-col md:flex-row gap-6 px-6">
                        {/* Left Side - Projects List */}
                        <div className="w-full md:w-11/30 bg-base-200 p-4 rounded-2xl border-2 border-base-300 relative overflow-y-auto">
                            <h2 className="text-3xl font-bold mb-4">Proyectos</h2>
                            <div className="grid grid-cols-1 gap-4 mt-6">
                                {projects.map((project) => (
                                    <div key={project.projectId} className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
                                        <div className="card-body P-0">
                                            <h3 className="card-title text-xl font-bold">{project.projectName}</h3>
                                            <p className="text-sm text-gray-500">{project.companyName}</p>
                                            <div className="flex justify-between items-center mt-">
                                                <span className="badge badge-info bg-secondary border-secondary">
                                                    Inicia: {new Date(project.startDate).toLocaleDateString()}
                                                </span>
                                                <button 
                                                    onClick={() => openProjectDetails(project)}
                                                    className="btn btn-sm btn-circle btn-ghost"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Side - Postulaciones List */}
                        <div className="w-full md:w-2/3">
                            <div className="grid grid-cols-1 md:grid-cols-1 max-h-[60vh] gap-4 bg-base-200 p-4 rounded-2xl border-2 border-base-300 overflow-y-auto">
                                <h2 className="text-3xl font-bold mb-4">Postulaciones</h2>
                                {postulations.length > 0 ? (
                                    <div className="overflow-y-auto">
                                        {postulations.map((postulation) => (
                                            <div key={postulation.postulationId} className="card bg-base-100 shadow-sm mb-3">
                                                <div className="card-body">
                                                    <div className="flex justify-between">
                                                        <div>
                                                            <h3 className="font-bold">{postulation.user.name}</h3>
                                                            <p className="text-sm">
                                                                {postulation.user.position} (Nivel {postulation.user.level})
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Postulado el: {new Date(postulation.postulationDate).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-semibold">{postulation.project.projectName}</p>
                                                            <p className="text-sm">{postulation.position.positionName}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {postulation.meetings.length > 0 ? 
                                                                    `${postulation.meetings.length} reunión(es)` : 
                                                                    'Sin reuniones'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10">
                                        <p>No hay postulaciones pendientes</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Detalles del Proyecto */}
            {isFuturProjModalOpen && selectedProject && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-3xl max-h-[90vh] overflow-y-auto">
                        <h3 className="font-bold text-2xl mb-4">{selectedProject.projectName}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="font-semibold">Empresa:</p>
                                <p>{selectedProject.companyName}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Fecha de inicio:</p>
                                <p>{new Date(selectedProject.startDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Fecha de fin:</p>
                                <p>{new Date(selectedProject.endDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Ubicación:</p>
                                <p>{selectedProject.country}, {selectedProject.region}</p>
                            </div>
                        </div>
                        
                        <div className="mt-6">
                            <p className="font-semibold">Descripción:</p>
                            <p className="mt-2">{selectedProject.description || "No hay descripción disponible"}</p>
                        </div>
                        
                        <div className="mt-6">
                            <h4 className="font-bold text-lg mb-2">Posiciones abiertas:</h4>
                            {selectedProject.openPositions.length > 0 ? (
                                <div className="space-y-2">
                                    {selectedProject.openPositions.map((position) => (
                                        <div key={position.positionId} className="bg-base-200 p-3 rounded-lg">
                                            <p className="font-semibold">{position.positionName}</p>
                                            <p className="text-sm">{position.description || "Sin descripción"}</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                <span className="badge badge-accent">
                                                    {position.capability || "Sin capacidad"}
                                                </span>
                                                {position.areas.map((area) => (
                                                    <span key={area.areaId} className="badge badge-outline">
                                                        {area.areaName}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No hay posiciones abiertas</p>
                            )}
                        </div>
                        
                        <div className="modal-action">
                            <button onClick={closeModal} className="btn">Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardDL;