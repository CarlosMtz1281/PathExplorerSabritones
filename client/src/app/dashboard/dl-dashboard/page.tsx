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
  filledPositions: (ProjectPosition & {
    assignedUser: {
      userId: number;
      name: string;
      position?: string;
      level?: number;
    };
  })[];
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
                                                        <div className="flex items-center gap-4">
                                                            <div className="avatar pl-1">
                                                                <div className="w-16 h-16 rounded-lg">
                                                                <Image
                                                                    width={96}
                                                                    height={96}
                                                                    src="/profilePhoto.jpg"
                                                                    alt={`Foto de ${postulation.user.name}`}
                                                                    className="object-cover w-full h-full"
                                                                />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold">{postulation.user.name}</h3>
                                                                <p className="text-sm">
                                                                    {postulation.position.positionName}
                                                                </p>
                                                                <p className="text-sm">
                                                                    Proyecto: {postulation.project.projectName}
                                                                </p>
                                                            </div>                                                            
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="flex items-center justify-end mb-4">
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    {new Date(postulation.postulationDate).toLocaleDateString()}
                                                                </p>
                                                                <button
                                                                    className="btn btn-sm btn-circle btn-ghost"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                            {/* botones de postulación (agender o ver meeting, aceptar postulacion, rechazar) con iconos */}
                                                            <div className="flex gap-1">
                                                                {postulation.meetings.length > 0 ? (
                                                                    <button 
                                                                    className="btn btn-sm btn-square btn-primary"
                                                                    title="Ver reunión programada"
                                                                    >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                    </svg>
                                                                    </button>
                                                                ) : (
                                                                    <button 
                                                                    className="btn btn-sm btn-square btn-secondary"
                                                                    title="Agendar nueva reunión"
                                                                    >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                    </button>
                                                                )}

                                                                <button 
                                                                    className="btn btn-sm btn-square btn-error"
                                                                    title="Rechazar postulación"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                                
                                                                <button 
                                                                    className="btn btn-sm btn-square btn-success"
                                                                    title="Aceptar postulación"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                </button>
                                                                
                                                            </div>
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
        <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto relative bg-gradient-to-br from-base-100 to-base-200 border border-primary/20">
            {/* Header del modal con botón de cerrar */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="font-bold text-3xl text-primary mb-1">{selectedProject.projectName}</h3>
                    <p className="text-lg text-secondary">{selectedProject.companyName}</p>
                </div>
                <button 
                    onClick={closeModal} 
                    className="btn btn-circle btn-ghost btn-sm absolute right-4 top-4"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Información principal en cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="card bg-base-100 shadow-sm border border-base-300">
                    <div className="card-body p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <h4 className="font-semibold text-lg">Fechas del Proyecto</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <p className="text-sm text-gray-500">Inicio:</p>
                                <p className="font-medium">{new Date(selectedProject.startDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Fin:</p>
                                <p className="font-medium">{new Date(selectedProject.endDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card bg-base-100 shadow-sm border border-base-300">
                    <div className="card-body p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <h4 className="font-semibold text-lg">Ubicación</h4>
                        </div>
                        <p className="font-medium">
                            {selectedProject.region ? `${selectedProject.region}, ${selectedProject.country}` : selectedProject.country || "No especificada"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Descripción */}
            <div className="mb-8">
                <h4 className="font-bold text-xl mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Descripción del Proyecto
                </h4>
                <div className="bg-base-100 p-4 rounded-lg border border-base-300">
                    <p className="whitespace-pre-line">
                        {selectedProject.description || "No hay descripción disponible"}
                    </p>
                </div>
            </div>

            {/* Posiciones abiertas */}
            <div className="mb-6">
                <h4 className="font-bold text-xl mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Posiciones Abiertas
                </h4>
                
                {selectedProject.openPositions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedProject.openPositions.map((position) => (
                            <div key={position.positionId} className="card bg-base-100 shadow-sm border border-primary/20 hover:border-primary/40 transition-colors">
                                <div className="card-body p-4">
                                    <div className="flex justify-between items-start">
                                        <h5 className="font-bold text-lg mb-1">{position.positionName}</h5>
                                        {position.capability && (
                                            <span className="badge badge-primary">
                                                {position.capability}
                                            </span>
                                        )}
                                    </div>
                                    
                                    {position.description && (
                                        <p className="text-sm mb-3">{position.description}</p>
                                    )}
                                    
                                    {position.areas.length > 0 && (
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Áreas:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {position.areas.map((area) => (
                                                    <span key={area.areaId} className="badge badge-outline badge-sm">
                                                        {area.areaName}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="alert alert-info shadow-lg">
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>No hay posiciones abiertas en este proyecto</span>
                        </div>
                    </div>
                )}
            </div>

            {/* posiciones ocupadas del proyecto */}
            <div className="mt-8">
                <h4 className="font-bold text-xl mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Posiciones Ocupadas
                </h4>
                
                {selectedProject.filledPositions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedProject.filledPositions.map((position) => (
                        <div key={position.positionId} className="card bg-base-100 shadow-sm border border-success/20 hover:border-success/40 transition-colors">
                        <div className="card-body p-4">
                            <div className="flex justify-between items-start">
                            <h5 className="font-bold text-lg mb-1">{position.positionName}</h5>
                            {position.capability && (
                                <span className="badge badge-success">
                                {position.capability}
                                </span>
                            )}
                            </div>
                            
                            {position.description && (
                            <p className="text-sm mb-3">{position.description}</p>
                            )}
                            
                            {position.areas.length > 0 && (
                            <div className="mb-3">
                                <p className="text-xs text-gray-500 mb-1">Áreas:</p>
                                <div className="flex flex-wrap gap-1">
                                {position.areas.map((area) => (
                                    <span key={area.areaId} className="badge badge-outline badge-sm">
                                    {area.areaName}
                                    </span>
                                ))}
                                </div>
                            </div>
                            )}
                            
                            <div className="mt-2 pt-2 border-t border-base-300">
                            <p className="text-sm font-semibold mb-1">Usuario asignado:</p>
                            <div className="flex items-center gap-2">
                                <div className="avatar placeholder">
                                <div className="bg-neutral text-neutral-content rounded-full w-8">
                                    <span className="text-xs">{position.assignedUser.name.split(' ').map(n => n[0]).join('')}</span>
                                </div>
                                </div>
                                <div>
                                <p className="font-medium">{position.assignedUser.name}</p>
                                <p className="text-xs">
                                    {position.assignedUser.position} (Nivel {position.assignedUser.level})
                                </p>
                                </div>
                            </div>
                            </div>
                        </div>
                        </div>
                    ))}
                    </div>
                ) : (
                    <div className="alert shadow-lg">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>No hay posiciones ocupadas en este proyecto</span>
                    </div>
                    </div>
                )}
                </div>


            {/* Footer del modal */}
            <div className="modal-action mt-2">
                <button 
                    onClick={closeModal} 
                    className="btn btn-primary"
                >
                    Cerrar
                </button>
            </div>
        </div>
    </div>
)}
        </div>
    );
};

export default DashboardDL;