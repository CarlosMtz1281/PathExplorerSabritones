"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import CurrentProjects from "@/components/dl-dashboard/current-projects/CurrentProjects";
import PastProjects from "@/components/dl-dashboard/past-projects/PastProjects";

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

interface PositionSkill {
  skillId: number;
  skillName: string;
}

interface PositionCertificate {
  certificateId: number;
  certificateName: string;
}

interface UserSkill {
  skillId: number;
  skillName: string;
}

interface UserCertificate {
  certificateId: number;
  certificateName: string;
}

interface ProjectPosition {
  positionId: number;
  positionName: string;
  description?: string;
  capability?: string;
  requiredSkills?: PositionSkill[];
  requiredCertificates?: PositionCertificate[];
  areas: {
    areaId: number;
    areaName: string;
  }[];
}

interface PostulationUser {
  userId: number;
  name: string;
  position?: string;
  level?: number;
  userSkills?: UserSkill[];
  userCertificates?: UserCertificate[];
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
    requiredSkills?: PositionSkill[];
    requiredCertificates?: PositionCertificate[];
  };
  user: PostulationUser;
  meetings: Meeting[];
}

interface Meeting {
  meetingId: number;
  meetingDate?: string | Date;
  meetingLink?: string;
  hasRecording?: boolean;
}

// Componente principal del dashboard
const DashboardDL = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [postulations, setPostulations] = useState<Postulation[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isFuturProjModalOpen, setIsFuturProjModalOpen] = useState(false);
  const [visibleTooltipId, setVisibleTooltipId] = useState<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const [selectedPostulation, setSelectedPostulation] =
    useState<Postulation | null>(null);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const sessionId = session?.sessionId;
      if (!sessionId) {
        console.error("Session ID is missing");
        return;
      }

      // Fetch initial data
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE}/dl/dataFuturo`,
        {
          headers: { "session-key": sessionId },
        }
      );

      if (res.status === 401) {
        console.error("Session expired or invalid. Redirecting to login...");
        localStorage.removeItem("sessionId");
        window.location.href = "/login";
        return;
      }

      let data = res.data;
      console.log("Fetched data:", data);
      
      // Check for recordings in meetings
      const meetingsWithRecordings = await Promise.all(
        data.postulations.flatMap(async (postulation: Postulation) => {
          if (!postulation.meetings || postulation.meetings.length === 0) {
            return postulation;
          }

          const updatedMeetings = await Promise.all(
            postulation.meetings.map(async (meeting: Meeting) => {
              if (!meeting.meetingLink) return meeting;
              
              try {
                const recordingCheck = await axios.get(
                  `http://localhost:5002/checkMeeting`,
                  {
                    params: { meeting_link: meeting.meetingLink }
                  }
                );
                
                return {
                  ...meeting,
                  hasRecording: recordingCheck.data?.exists || false
                };
              } catch (error) {
                console.error(`Error checking recording for meeting ${meeting.meetingId}:`, error);
                return {
                  ...meeting,
                  hasRecording: false
                };
              }
            })
          );

          return {
            ...postulation,
            meetings: updatedMeetings
          };
        })
      );

      console.log("Meetings with recordings:", meetingsWithRecordings);

      // Update state with the enriched data
      setProjects(data.projects || []);
      setPostulations(meetingsWithRecordings || []);

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [session]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (visibleTooltipId !== null) {
        setVisibleTooltipId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [visibleTooltipId]);

  const openProjectDetails = (project: Project) => {
    setSelectedProject(project);
    setIsFuturProjModalOpen(true);
  };

  const closeModal = () => {
    setIsFuturProjModalOpen(false);
    setSelectedProject(null);
  };

  const toggleTooltip = (postulationId: number) => {
    setVisibleTooltipId(
      visibleTooltipId === postulationId ? null : postulationId
    );
  };

  const userHasSkill = (user: PostulationUser, skillId: number): boolean => {
    return user.userSkills?.some((s) => s.skillId === skillId) || false;
  };

  const userHasCertificate = (
    user: PostulationUser,
    certificateId: number
  ): boolean => {
    return (
      user.userCertificates?.some((c) => c.certificateId === certificateId) ||
      false
    );
  };

  // Función para navegar entre meses
  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setMonth(
      direction === "prev"
        ? currentDate.getMonth() - 1
        : currentDate.getMonth() + 1
    );
    setCurrentDate(newDate);
  };

  // Función para obtener días del mes
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    return { daysInMonth, firstDayOfMonth };
  };

  // Función para formatear la fecha
  const formatSelectedDate = (date: Date | null) => {
    if (!date) return "No seleccionada";
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleScheduleMeeting = async () => {
    if (!selectedDate || !selectedTime || !selectedPostulation) return;

    try {
      const [hours, minutes] = selectedTime.split(":");
      const meetingDate = new Date(selectedDate);
      meetingDate.setHours(parseInt(hours), parseInt(minutes));

      // flask API para crear la reunión
      const flaskResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_FLASK_WEB_API_URL}/api/create-meeting`,
        {
          username: session?.user?.name || "Host"
        }
      );

      if (!flaskResponse.data.meeting_id) {
        throw new Error("No se pudo crear el ID de reunión");
      }

      const meetingId = flaskResponse.data.meeting_id;

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}/dl/scheduleMeeting`,
        {
          postulationId: selectedPostulation.postulationId,
          meetingDate: meetingDate.toISOString(),
          meetingTime: selectedTime,
          meetingLink: meetingId, // Usar el ID de reunión de Flask
        },
        {
          headers: { "session-key": session?.sessionId },
        }
      );

      //console.log("Hola");

      console.log("Response data:", response.data);

      if (response.data.success) {
        // Mostrar alerta de éxito
        alert("¡Reunión agendada exitosamente!");
        console.log("Meeting scheduled successfully:", response.data);

        // Recargar los datos
        await fetchData();

        // Resetear estados
        setMeetingModalOpen(false);
        setSelectedDate(null);
        setSelectedTime(null);
        setSelectedPostulation(null);
      }
    } catch (error) {
      console.error("Error scheduling meeting:", error);
      alert("Ocurrió un error al agendar la reunión");
    }
  };

  const handleRejectPostulation = async (postulationId: number) => {
    try {
      const sessionId = session?.sessionId;
      if (!sessionId) {
        console.error("Session ID is missing");
        return;
      }

      // Confirmación antes de rechazar
      const confirmReject = window.confirm(
        "¿Estás seguro que deseas rechazar esta postulación?"
      );
      if (!confirmReject) return;

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE}/dl/rejectPostulation`,
        { postulationId },
        { headers: { "session-key": sessionId } }
      );

      if (response.data.success) {
        alert("Postulación rechazada exitosamente");
        await fetchData(); // Recargar los datos
      }
    } catch (error) {
      console.error("Error rejecting postulation:", error);
      alert("Ocurrió un error al rechazar la postulación");
    }
  };

  const handleAcceptPostulation = async (postulationId: number) => {
    try {
      const sessionId = session?.sessionId;
      if (!sessionId) {
        console.error("Session ID is missing");
        return;
      }

      // Confirmación antes de aceptar
      const confirmAccept = window.confirm(
        "¿Estás seguro que deseas aceptar esta postulación? Esto invalidará todas las demás postulaciones para este puesto."
      );
      if (!confirmAccept) return;

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE}/dl/acceptPostulation`,
        { postulationId },
        { headers: { "session-key": sessionId } }
      );

      if (response.data.success) {
        alert("Postulación aceptada exitosamente y usuario asignado al puesto");
        await fetchData(); // Recargar los datos
      }
    } catch (error) {
      console.error("Error accepting postulation:", error);
      alert("Ocurrió un error al aceptar la postulación");
    }
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
                  <div
                    key={project.projectId}
                    className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="card-body P-0">
                      <h3 className="card-title text-xl font-bold">
                        {project.projectName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {project.companyName}
                      </p>
                      <div className="flex justify-between items-center mt-">
                        <span className="badge badge-info bg-secondary border-secondary">
                          Inicia:{" "}
                          {new Date(project.startDate).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => openProjectDetails(project)}
                          className="btn btn-sm btn-circle btn-ghost"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
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
                      <div
                        key={postulation.postulationId}
                        className="card bg-base-100 shadow-sm mb-3"
                      >
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
                                <h3 className="font-bold">
                                  {postulation.user.name}
                                </h3>
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
                                <p className="text-`xs text-gray-500 mt-1">
                                  {new Date(
                                    postulation.postulationDate
                                  ).toLocaleDateString()}
                                </p>
                                <div className="relative" ref={tooltipRef}>
                                  <button
                                    onClick={() =>
                                      toggleTooltip(postulation.postulationId)
                                    }
                                    className="btn btn-sm btn-circle btn-ghost"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                  </button>

                                  {visibleTooltipId ===
                                    postulation.postulationId && (
                                    <div className="absolute right-0 z-10 w-96 p-4 mt-2 bg-base-100 rounded-lg shadow-xl border-2 border-base-300">
                                      <div className="text-sm text-left">
                                        {/* Skills requeridos */}
                                        <div className="mb-3">
                                          <h5 className="font-semibold mb-1">
                                            Habilidades requeridas:
                                          </h5>
                                          {postulation.position
                                            .requiredSkills &&
                                          postulation.position.requiredSkills
                                            .length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                              {postulation.position.requiredSkills.map(
                                                (skill) => (
                                                  <span
                                                    key={skill.skillId}
                                                    className={`badge badge-sm ${
                                                      userHasSkill(
                                                        postulation.user,
                                                        skill.skillId
                                                      )
                                                        ? "badge-success"
                                                        : "badge-failure"
                                                    }`}
                                                  >
                                                    {skill.skillName}
                                                    {userHasSkill(
                                                      postulation.user,
                                                      skill.skillId
                                                    ) && (
                                                      <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-3 w-3 ml-1"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                      >
                                                        <path
                                                          fillRule="evenodd"
                                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                          clipRule="evenodd"
                                                        />
                                                      </svg>
                                                    )}
                                                  </span>
                                                )
                                              )}
                                            </div>
                                          ) : (
                                            <p className="text-gray-500">
                                              No se requieren habilidades
                                              específicas
                                            </p>
                                          )}
                                        </div>

                                        {/* Certificados requeridos */}
                                        <div>
                                          <h5 className="font-semibold mb-1">
                                            Certificados requeridos:
                                          </h5>
                                          {postulation.position
                                            .requiredCertificates &&
                                          postulation.position
                                            .requiredCertificates.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                              {postulation.position.requiredCertificates.map(
                                                (cert) => (
                                                  <span
                                                    key={cert.certificateId}
                                                    className={`badge badge-sm ${
                                                      userHasCertificate(
                                                        postulation.user,
                                                        cert.certificateId
                                                      )
                                                        ? "badge-success"
                                                        : "badge-failure"
                                                    }`}
                                                  >
                                                    {cert.certificateName}
                                                    {userHasCertificate(
                                                      postulation.user,
                                                      cert.certificateId
                                                    ) && (
                                                      <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-3 w-3 ml-1"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                      >
                                                        <path
                                                          fillRule="evenodd"
                                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                          clipRule="evenodd"
                                                        />
                                                      </svg>
                                                    )}
                                                  </span>
                                                )
                                              )}
                                            </div>
                                          ) : (
                                            <p className="text-gray-500">
                                              No se requieren certificados
                                              específicos
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              {/* botones de postulación (agender o ver meeting, aceptar postulacion, rechazar) con iconos */}
                              <div className="flex gap-1">
                                {postulation.meetings.length > 0 ? (
                                  postulation.meetings[0].hasRecording ? (
                                    <div className="dropdown dropdown-end">
                                      <button
                                        tabIndex={0}
                                        className="btn btn-sm btn-square btn-accent"
                                        title="Ver reunión grabada"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                      </button>
                                      <div
                                        tabIndex={0}
                                        className="dropdown-content z-[1] menu p-4 shadow bg-base-100 rounded-box w-64"
                                      >
                                        <h4 className="font-bold mb-2">
                                          Reunión grabada
                                        </h4>
                                        {/* boton de descarga de grabación */}
                                        <button
                                          onClick={() => {
                                            // Crear un enlace temporal para la descarga
                                            const downloadLink = document.createElement('a');
                                            downloadLink.href = `http://localhost:5002/getVideo?meeting_id=${postulation.meetings[0].meetingLink}`;
                                            downloadLink.target = '_blank';
                                            downloadLink.download = `reunion_${postulation.meetings[0].meetingLink}.webm`;
                                            document.body.appendChild(downloadLink);
                                            downloadLink.click();
                                            document.body.removeChild(downloadLink);
                                          }}
                                          className="btn btn-sm btn-primary mt-2"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                          </svg>
                                          Descargar grabación
                                        </button>

                                      </div>
                                    </div>
                                  ) : (
                                    <div className="dropdown dropdown-end">
                                      <button
                                        tabIndex={0}
                                        className="btn btn-sm btn-square btn-primary"
                                        title="Ver reunión programada"
                                      >
                                        <svg xmlns="http://www.w0.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                      </button>
                                      <div
                                        tabIndex={0}
                                        className="dropdown-content z-[1] menu p-4 shadow bg-base-100 rounded-box w-64"
                                      >
                                        <h4 className="font-bold mb-2">
                                          Reunión programada
                                        </h4>
                                        <p className="mb-2">
                                          <span className="font-semibold">Fecha:</span>{" "}
                                          {new Date(
                                            postulation.meetings[0].meetingDate!
                                          ).toLocaleString()}
                                        </p>
                                        <a
                                          href={`/meet/${postulation.meetings[0].meetingLink}?username=${session?.user?.name}&record=true`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="btn btn-sm btn-primary mt-2 inline-block text-base font-semibold pt-0.5"
                                        >
                                          Unirse a la reunión
                                        </a>
                                      </div>
                                    </div>
                                  )
                                ) : (
                                  <button
                                    className="btn btn-sm btn-square btn-secondary"
                                    title="Agendar nueva reunión"
                                    onClick={() => {
                                      setSelectedPostulation(postulation);
                                      setMeetingModalOpen(true);
                                    }}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      />
                                    </svg>
                                  </button>
                                )}

                                <button
                                  className="btn btn-sm btn-square btn-error"
                                  title="Rechazar postulación"
                                  onClick={() =>
                                    handleRejectPostulation(
                                      postulation.postulationId
                                    )
                                  }
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>

                                <button
                                  className="btn btn-sm btn-square btn-success"
                                  title="Aceptar postulación"
                                  onClick={() =>
                                    handleAcceptPostulation(
                                      postulation.postulationId
                                    )
                                  }
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
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
      <CurrentProjects />
      <PastProjects />

      {/* Modal de Detalles del Proyecto */}
      {isFuturProjModalOpen && selectedProject && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto relative bg-gradient-to-br from-base-100 to-base-200 border border-primary/20">
            {/* Header del modal con botón de cerrar */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-bold text-3xl text-primary mb-1">
                  {selectedProject.projectName}
                </h3>
                <p className="text-lg text-secondary">
                  {selectedProject.companyName}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="btn btn-circle btn-ghost btn-sm absolute right-4 top-4"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Información principal en cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="card bg-base-100 shadow-sm border border-base-300">
                <div className="card-body p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <h4 className="font-semibold text-lg">
                      Fechas del Proyecto
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-gray-500">Inicio:</p>
                      <p className="font-medium">
                        {new Date(
                          selectedProject.startDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fin:</p>
                      <p className="font-medium">
                        {new Date(selectedProject.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-sm border border-base-300">
                <div className="card-body p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <h4 className="font-semibold text-lg">Ubicación</h4>
                  </div>
                  <p className="font-medium">
                    {selectedProject.region
                      ? `${selectedProject.region}, ${selectedProject.country}`
                      : selectedProject.country || "No especificada"}
                  </p>
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className="mb-8">
              <h4 className="font-bold text-xl mb-3 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Descripción del Proyecto
              </h4>
              <div className="bg-base-100 p-4 rounded-lg border border-base-300">
                <p className="whitespace-pre-line">
                  {selectedProject.description ||
                    "No hay descripción disponible"}
                </p>
              </div>
            </div>

            {/* Posiciones abiertas */}
            <div className="mb-6">
              <h4 className="font-bold text-xl mb-3 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Posiciones Abiertas
              </h4>

              {selectedProject.openPositions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedProject.openPositions.map((position) => (
                    <div
                      key={position.positionId}
                      className="card bg-base-100 shadow-sm border border-primary/20 hover:border-primary/40 transition-colors"
                    >
                      <div className="card-body p-4">
                        <div className="flex justify-between items-start">
                          <h5 className="font-bold text-lg mb-1">
                            {position.positionName}
                          </h5>
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
                                <span
                                  key={area.areaId}
                                  className="badge badge-outline badge-sm"
                                >
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="stroke-current flex-shrink-0 h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <span>No hay posiciones abiertas en este proyecto</span>
                  </div>
                </div>
              )}
            </div>

            {/* posiciones ocupadas del proyecto */}
            <div className="mt-8">
              <h4 className="font-bold text-xl mb-3 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-success"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Posiciones Ocupadas
              </h4>

              {selectedProject.filledPositions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedProject.filledPositions.map((position) => (
                    <div
                      key={position.positionId}
                      className="card bg-base-100 shadow-sm border border-success/20 hover:border-success/40 transition-colors"
                    >
                      <div className="card-body p-4">
                        <div className="flex justify-between items-start">
                          <h5 className="font-bold text-lg mb-1">
                            {position.positionName}
                          </h5>
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
                                <span
                                  key={area.areaId}
                                  className="badge badge-outline badge-sm"
                                >
                                  {area.areaName}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-2 pt-2 border-t border-base-300">
                          <p className="text-sm font-semibold mb-1">
                            Usuario asignado:
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="avatar placeholder">
                              <div className="rounded-full w-12">
                                <div className="avatar pl-1">
                                  <div className="w-12 h-12 rounded-lg">
                                    <Image
                                      width={96}
                                      height={96}
                                      src="/profilePhoto.jpg"
                                      alt={`Foto de ${position.assignedUser.name}`}
                                      className="object-cover w-full h-full"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div>
                              <p className="font-medium">
                                {position.assignedUser.name}
                              </p>
                              <p className="text-xs">
                                {position.assignedUser.position} (Nivel{" "}
                                {position.assignedUser.level})
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="stroke-current flex-shrink-0 h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <span>No hay posiciones ocupadas en este proyecto</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div className="modal-action mt-2">
              <button onClick={closeModal} className="btn btn-primary">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {meetingModalOpen && selectedPostulation && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <button
              onClick={() => setMeetingModalOpen(false)}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              ✕
            </button>
            <h3 className="font-bold text-2xl mb-6 text-center">
              Agendar reunión con {selectedPostulation.user.name}
            </h3>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Calendario - Sección izquierda */}
              <div className="w-full lg:w-1/2">
                <div className="card bg-base-200 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => navigateMonth("prev")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <h4 className="font-semibold text-lg">
                      {currentDate.toLocaleDateString("es-ES", {
                        month: "long",
                        year: "numeric",
                      })}
                    </h4>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => navigateMonth("next")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center">
                    {/* Días de la semana */}
                    {["D", "L", "M", "M", "J", "V", "S"].map((day, i) => (
                      <div key={`day-${i}`} className="font-bold text-sm p-2">
                        {day}
                      </div>
                    ))}

                    {/* Días del mes */}
                    {(() => {
                      const { daysInMonth, firstDayOfMonth } =
                        getDaysInMonth(currentDate);
                      const days = [];
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);

                      // Espacios vacíos al inicio
                      for (let i = 0; i < firstDayOfMonth; i++) {
                        days.push(
                          <div key={`empty-${i}`} className="p-2"></div>
                        );
                      }

                      // Días del mes
                      for (let day = 1; day <= daysInMonth; day++) {
                        const date = new Date(
                          currentDate.getFullYear(),
                          currentDate.getMonth(),
                          day
                        );
                        const isToday =
                          date.toDateString() === today.toDateString();
                        const isSelected =
                          selectedDate?.toDateString() === date.toDateString();
                        const isPastDate = date < today;

                        days.push(
                          <button
                            key={`date-${day}`}
                            className={`btn btn-sm rounded-full ${
                              isToday
                                ? "btn-primary"
                                : isSelected
                                ? "btn-accent"
                                : "btn-ghost"
                            } ${isPastDate ? "btn-disabled opacity-90" : ""}`}
                            onClick={() => !isPastDate && setSelectedDate(date)}
                            disabled={isPastDate}
                          >
                            {day}
                          </button>
                        );
                      }

                      return days;
                    })()}
                  </div>
                </div>
              </div>

              {/* Horarios - Sección derecha */}
              <div className="w-full lg:w-1/2">
                <div className="card bg-base-200 p-4">
                  {selectedDate ? (
                    <div className="grid grid-cols-2 gap-2">
                      {Array.from({ length: 17 }).map((_, i) => {
                        const hour = 9 + Math.floor(i * 0.5);
                        const minute = (i % 2) * 30;
                        const timeString = `${hour}:${minute
                          .toString()
                          .padStart(2, "0")}`;
                        const fullTimeString = `${hour}:${minute
                          .toString()
                          .padStart(2, "0")}:00`;

                        return (
                          <button
                            key={`time-${i}`}
                            className={`btn btn-sm ${
                              selectedTime === fullTimeString
                                ? "btn-accent"
                                : "btn-outline"
                            }`}
                            onClick={() => setSelectedTime(fullTimeString)}
                          >
                            {timeString} {hour >= 12 ? "PM" : "AM"}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Por favor selecciona una fecha primero
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Resumen de la reunión */}
            <div className="mt-6 bg-base-100 p-4 rounded-box border border-base-300">
              <h4 className="font-semibold text-lg mb-3">
                Resumen de la reunión
              </h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="w-24 font-medium">Fecha:</span>
                  <span
                    className={selectedDate ? "text-primary" : "text-gray-500"}
                  >
                    {selectedDate
                      ? formatSelectedDate(selectedDate)
                      : "No seleccionada"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-24 font-medium">Hora:</span>
                  <span
                    className={selectedTime ? "text-primary" : "text-gray-500"}
                  >
                    {selectedTime
                      ? `${selectedTime.split(":")[0]}:${
                          selectedTime.split(":")[1]
                        } ${
                          parseInt(selectedTime.split(":")[0]) >= 12
                            ? "PM"
                            : "AM"
                        }`
                      : "No seleccionada"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-24 font-medium">Enlace:</span>
                  <span className="text-primary">
                    Se generará automáticamente
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-action mt-6">
              <button
                className="btn"
                onClick={() => {
                  setMeetingModalOpen(false);
                  setSelectedDate(null);
                  setSelectedTime(null);
                }}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                disabled={!selectedDate || !selectedTime}
                onClick={() => {
                  if (selectedDate && selectedTime) {
                    const meetingDate = new Date(selectedDate);
                    const [hour, minute] = selectedTime.split(":").map(Number);
                    meetingDate.setHours(hour, minute, 0, 0);

                    handleScheduleMeeting();

                    setMeetingModalOpen(false);
                    setSelectedDate(null);
                    setSelectedTime(null);
                  }
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Agendar reunión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardDL;
