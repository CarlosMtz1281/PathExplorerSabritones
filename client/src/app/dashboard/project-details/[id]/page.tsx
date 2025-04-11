"use client";

import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";

// Define types based on the API response structure
interface ProjectPosition {
  position_id: number;
  position_name: string;
  project_id: number;
  count: number;
  user_id: number | null;
  Users: any | null;
  Project_Position_Skills: Array<{
    Skills: {
      skill_id: number;
      skill_name: string;
    };
  }>;
  Project_Position_Certificates: Array<{
    Certificates: {
      certificate_id: number;
      certificate_name: string;
    };
  }>;
  Postulations: Array<{
    postulation_id: number;
    user_id: number;
    Users: {
      user_id: number;
      name: string;
      mail: string;
    };
    Meeting: any | null;
  }>;
}

interface Project {
  id: number;
  name: string;
  description: string;
  company: string;
  start_date: string;
  end_date: string | null;
  region: {
    region_id: number;
    region_name: string;
    country: string;
    timezone: string;
  };
  delivery_lead: {
    user_id: number;
    name: string;
    mail: string;
  };
  positions: ProjectPosition[];
  team_members: Array<{
    user_id: number;
    project_id: number;
    Users: {
      user_id: number;
      name: string;
      mail: string;
    };
  }>;
  feedback: Array<any>;
}

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVacancy, setSelectedVacancy] = useState<number | null>(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/project/repositories/${id}`
        );

        if (!response.ok) {
          throw new Error(`Error fetching project: ${response.status}`);
        }

        const data = await response.json();
        setProject(data);

        // Set initial selected vacancy if positions exist
        if (data.positions && data.positions.length > 0) {
          setSelectedVacancy(data.positions[0].position_id);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        console.error("Error fetching project details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProjectDetails();
    }
  }, [id]);

  // Calculate project duration in months
  const calculateDuration = (startDate: string, endDate: string | null) => {
    if (!endDate) return "En progreso";

    const start = new Date(startDate.split("/").reverse().join("-"));
    const end = new Date(endDate.split("/").reverse().join("-"));

    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    return `${months} ${months === 1 ? "mes" : "meses"}`;
  };

  // Get candidates for selected position
  const getCandidatesForPosition = () => {
    if (!project || !selectedVacancy) return [];

    const position = project.positions.find(
      (p) => p.position_id === selectedVacancy
    );
    return position
      ? position.Postulations.map((p) => ({
          id: p.Users.user_id,
          name: p.Users.name,
          email: p.Users.mail,
          meeting: p.Meeting,
          // Calculate compatibility based on skills and certificates (placeholder)
          compatibility: Math.floor(Math.random() * 40) + 60, // Placeholder: random 60-100%
          certifications:
            position.Project_Position_Certificates.length > 0
              ? "Tiene certificaciones requeridas"
              : "Sin certificaciones requeridas",
        }))
      : [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-base-200 p-10">
        <div className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error || "No se pudo cargar el proyecto"}</span>
        </div>
      </div>
    );
  }

  const candidates = getCandidatesForPosition();
  const selectedPosition = project.positions.find(
    (p) => p.position_id === selectedVacancy
  );
  const duration = calculateDuration(project.start_date, project.end_date);

  return (
    <div className="min-h-screen bg-base-200 p-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project Details Column */}
        <div className="col-span-1 space-y-8">
          {/* Project Info */}
          <div className="bg-base-100 rounded-lg shadow-md border border-base-300">
            <div className="card">
              <div className="card-title bg-primary text-primary-content p-4 rounded-t-lg">
                <h2 className="text-2xl font-bold">{project.name}</h2>
              </div>
              <div className="card-body p-6">
                <p className="text-sm text-secondary mb-2">
                  <strong>Fechas:</strong> {project.start_date} -{" "}
                  {project.end_date || "En progreso"}
                </p>
                <p className="text-sm text-secondary mb-2">
                  <strong>Duración:</strong>{" "}
                  <span className="link link-primary">{duration}</span>
                </p>
                <p className="text-sm text-secondary mb-2">
                  <strong>Delivery Lead:</strong> {project.delivery_lead.name}
                </p>
                <p className="text-sm text-secondary mb-2">
                  <strong>Empresa:</strong> {project.company}
                </p>
                <p className="text-sm text-secondary mb-2">
                  <strong>Región:</strong> {project.region.region_name},{" "}
                  {project.region.country}
                </p>
                <p className="text-sm text-secondary">
                  <strong>Descripción:</strong> {project.description}
                </p>
              </div>
            </div>
          </div>

          {/* Vacancies */}
          <div className="bg-base-100 rounded-lg shadow-md border border-base-300">
            <div className="card">
              <div className="card-title bg-primary text-primary-content p-4 rounded-t-lg">
                <h2 className="text-2xl font-bold">Vacantes</h2>
              </div>
              <div className="card-body p-6">
                <div className="form-control w-full mb-4">
                  <label className="label">
                    <span className="label-text">Seleccionar vacante</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={selectedVacancy || ""}
                    onChange={(e) => setSelectedVacancy(Number(e.target.value))}
                  >
                    {project.positions.map((position) => (
                      <option
                        key={position.position_id}
                        value={position.position_id}
                      >
                        {position.position_name} ({position.count})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedPosition && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <h3 className="font-bold mb-2">
                        Detalles de la vacante:
                      </h3>
                      <p className="text-sm text-secondary">
                        <strong>Rol:</strong> {selectedPosition.position_name}
                      </p>
                      <p className="text-sm text-secondary mt-2">
                        <strong>Disponibles:</strong> {selectedPosition.count}
                      </p>
                    </div>

                    {selectedPosition.Project_Position_Skills.length > 0 && (
                      <div>
                        <h3 className="font-bold mb-2">Skills requeridos:</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedPosition.Project_Position_Skills.map(
                            (pps) => (
                              <div
                                key={pps.Skills.skill_id}
                                className="badge badge-outline"
                              >
                                {pps.Skills.skill_name}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {selectedPosition.Project_Position_Certificates.length >
                      0 && (
                      <div>
                        <h3 className="font-bold mb-2">
                          Certificaciones requeridas:
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedPosition.Project_Position_Certificates.map(
                            (ppc) => (
                              <div
                                key={ppc.Certificates.certificate_id}
                                className="badge badge-outline badge-secondary"
                              >
                                {ppc.Certificates.certificate_name}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Candidates */}
        <div className="col-span-2 bg-base-100 p-6 rounded-lg shadow-md border border-base-300 max-h-[80vh]">
          <h2 className="text-2xl font-bold text-primary mb-4">
            Candidatos ({candidates.length})
          </h2>

          {candidates.length > 0 ? (
            <div className="space-y-4 overflow-y-auto max-h-[calc(80vh-5rem)]">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex items-center justify-between bg-base-200 p-4 rounded-lg shadow-sm border border-base-300"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-primary">
                      {candidate.name}
                    </h3>
                    <p className="text-sm text-secondary">{candidate.email}</p>
                    <p className="text-sm text-success">
                      {candidate.certifications}
                    </p>
                    {candidate.meeting && (
                      <p className="text-sm text-info">
                        Reunión programada:{" "}
                        {new Date(
                          candidate.meeting.meeting_date
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-sm text-secondary">Compatibilidad</p>
                      <p className="text-2xl font-bold text-success">
                        {candidate.compatibility}%
                      </p>
                    </div>
                    <button className="btn btn-primary">
                      {candidate.meeting ? "Ver detalles" : "Programar reunión"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-base-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="text-base-300 mt-4">
                No hay candidatos para esta posición
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
