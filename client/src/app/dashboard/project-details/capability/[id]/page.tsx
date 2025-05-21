"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import axios from "axios";

// Updated interfaces with more precise types
interface Skill {
  skill_id: number;
  name: string;
  technical: boolean;
  skill_name?: string; // For compatibility with different API responses
}

interface Certificate {
  certificate_id: number;
  certificate_name: string;
  certificate_desc?: string;
  provider?: string;
}

interface ProjectPositionSkill {
  position_id: number;
  skill_id: number;
  Skills: Skill;
}

interface ProjectPositionCertificate {
  position_id: number;
  certificate_id: number;
  Certificates: Certificate;
}

interface ProjectPosition {
  position_id: number;
  project_id: number;
  position_name: string;
  position_desc: string;
  user_id: number | null;
  Project_Position_Skills: ProjectPositionSkill[];
  Project_Position_Certificates: ProjectPositionCertificate[];
  Postulations?: Array<{
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

interface TeamMember {
  user_id: number;
  name: string;
  mail: string;
  position?: string;
  matchedSkills?: Skill[];
  matchedCertificates?: Certificate[];
  totalMatches?: number;
}

interface Project {
  id: number;
  name: string;
  description?: string;
  start_date: string;
  end_date: string | null;
  vacants: number;
  details: {
    company: string;
    country: string;
    capability: string;
  };
  positions: ProjectPosition[];
  team_members?: Array<{
    user_id: number;
    project_id: number;
    Users: {
      user_id: number;
      name: string;
      mail: string;
    };
  }>;
  feedback?: Array<any>;
}

const ProjectDetails = () => {
  const { id } = useParams();
  const { data: session } = useSession();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVacancy, setSelectedVacancy] = useState<number | null>(null);
  const [candidates, setCandidates] = useState<TeamMember[]>([]);
  const [capabilityTeamMembers, setCapabilityTeamMembers] = useState<
    TeamMember[]
  >([]);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [positionSkills, setPositionSkills] = useState<Skill[]>([]);
  const [positionCertificates, setPositionCertificates] = useState<
    Certificate[]
  >([]);

  // Fetch project details
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/project/getProjectById/${id}`
        );

        if (!response.ok) {
          throw new Error(`Error fetching project: ${response.status}`);
        }

        const data = await response.json();
        console.log("Project data:", data);
        setProject(data);

        // Set initial selected vacancy if vacant positions exist
        const vacantPositions = data.positions.filter(
          (p) => p.user_id === null
        );
        if (vacantPositions.length > 0) {
          setSelectedVacancy(vacantPositions[0].position_id);
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

  // Fetch capability team members based on current user's session
  useEffect(() => {
    const fetchCapabilityTeamMembers = async () => {
      if (!session || !session.user) return;

      try {
        setLoadingTeam(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/employee/getCapabilityTeamMembers/${session.user.id}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error fetching capability team: ${response.status}`);
        }

        const data = await response.json();
        setCapabilityTeamMembers(data);
      } catch (err) {
        console.error("Error fetching capability team members:", err);
      } finally {
        setLoadingTeam(false);
      }
    };

    fetchCapabilityTeamMembers();
  }, [session]);

  // Fetch position skills and certificates when selected vacancy changes
  useEffect(() => {
    const fetchPositionRequirements = async () => {
      if (!selectedVacancy || !project) return;

      setLoadingSkills(true);

      try {
        // Find the selected position from the project data
        const position = project.positions.find(
          (p) => p.position_id === selectedVacancy
        );

        if (!position) {
          console.error("Selected position not found");
          return;
        }

        // Fetch position skills if not already included in the project data
        if (
          !position.Project_Position_Skills ||
          position.Project_Position_Skills.length === 0
        ) {
          const skillsResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE}/project/getPositionSkills/${selectedVacancy}`
          );

          if (skillsResponse.ok) {
            const skillsData = await skillsResponse.json();
            setPositionSkills(skillsData);

            // Update the position in the project object
            const updatedPositions = project.positions.map((p) => {
              if (p.position_id === selectedVacancy) {
                return {
                  ...p,
                  Project_Position_Skills: skillsData.map((skill: Skill) => ({
                    position_id: selectedVacancy,
                    skill_id: skill.skill_id,
                    Skills: skill,
                  })),
                };
              }
              return p;
            });

            setProject({ ...project, positions: updatedPositions });
          }
        } else {
          // Use the skills already in the position data
          setPositionSkills(
            position.Project_Position_Skills.map((pps) => pps.Skills)
          );
        }

        // Fetch position certificates if not already included
        if (
          !position.Project_Position_Certificates ||
          position.Project_Position_Certificates.length === 0
        ) {
          const certsResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE}/project/getPositionCertificates/${selectedVacancy}`
          );

          if (certsResponse.ok) {
            const certsData = await certsResponse.json();
            setPositionCertificates(certsData);

            // Update the position in the project object
            const updatedPositions = project.positions.map((p) => {
              if (p.position_id === selectedVacancy) {
                return {
                  ...p,
                  Project_Position_Certificates: certsData.map(
                    (cert: Certificate) => ({
                      position_id: selectedVacancy,
                      certificate_id: cert.certificate_id,
                      Certificates: cert,
                    })
                  ),
                };
              }
              return p;
            });

            setProject({ ...project, positions: updatedPositions });
          }
        } else {
          // Use the certificates already in the position data
          setPositionCertificates(
            position.Project_Position_Certificates.map(
              (ppc) => ppc.Certificates
            )
          );
        }
      } catch (error) {
        console.error("Error fetching position requirements:", error);
      } finally {
        setLoadingSkills(false);
      }
    };

    fetchPositionRequirements();
  }, [selectedVacancy, project]);

  // Fetch candidates and match their skills and certificates
  useEffect(() => {
    const fetchCandidates = async () => {
      if (!project || !selectedVacancy || !capabilityTeamMembers.length) return;

      try {
        const selectedPosition = project.positions.find(
          (p) => p.position_id === selectedVacancy
        );

        if (!selectedPosition) return;

        // Use the skills and certificates we already have or fetch them if needed
        let requiredSkills: string[] = [];
        let requiredCertificates: string[] = [];

        if (
          selectedPosition.Project_Position_Skills &&
          selectedPosition.Project_Position_Skills.length > 0
        ) {
          requiredSkills = selectedPosition.Project_Position_Skills.map(
            (pps) => pps.Skills.skill_name || pps.Skills.name
          );
        } else if (positionSkills.length > 0) {
          requiredSkills = positionSkills.map(
            (skill) => skill.skill_name || skill.name
          );
        }

        if (
          selectedPosition.Project_Position_Certificates &&
          selectedPosition.Project_Position_Certificates.length > 0
        ) {
          requiredCertificates =
            selectedPosition.Project_Position_Certificates.map(
              (ppc) => ppc.Certificates.certificate_name
            );
        } else if (positionCertificates.length > 0) {
          requiredCertificates = positionCertificates.map(
            (cert) => cert.certificate_name
          );
        }

        console.log("Required skills:", requiredSkills);
        console.log("Required certificates:", requiredCertificates);

        const candidateData = await Promise.all(
          capabilityTeamMembers.map(async (member) => {
            try {
              const [skillsResponse, certificatesResponse] = await Promise.all([
                fetch(
                  `${process.env.NEXT_PUBLIC_API_BASE}/employee/getsSkillsId/${member.user_id}`
                ),
                fetch(
                  `${process.env.NEXT_PUBLIC_API_BASE}/course/getCertificatesByUserId/${member.user_id}`
                ),
              ]);

              const skills = await skillsResponse.json();
              const certificates = await certificatesResponse.json();

              // Match skills and certificates
              const matchedSkills = skills.filter((skill: any) =>
                requiredSkills.includes(skill.skill_name || skill.name)
              );
              const matchedCertificates = certificates.filter((cert: any) =>
                requiredCertificates.includes(cert.certificate_name)
              );

              return {
                ...member,
                matchedSkills,
                matchedCertificates,
                totalMatches: matchedSkills.length + matchedCertificates.length,
              };
            } catch (error) {
              console.error(
                `Error fetching data for member ${member.user_id}:`,
                error
              );
              return {
                ...member,
                matchedSkills: [],
                matchedCertificates: [],
                totalMatches: 0,
              };
            }
          })
        );

        // Sort candidates by total matches in descending order
        candidateData.sort(
          (a, b) => (b.totalMatches || 0) - (a.totalMatches || 0)
        );
        setCandidates(candidateData);
      } catch (error) {
        console.error("Error fetching candidates:", error);
      }
    };

    fetchCandidates();
  }, [
    project,
    selectedVacancy,
    capabilityTeamMembers,
    positionSkills,
    positionCertificates,
  ]);

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

  // Get vacant positions
  const getVacantPositions = () => {
    if (!project) return [];
    return project.positions.filter((p) => p.user_id === null);
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

  const vacantPositions = getVacantPositions();
  const selectedPosition = project.positions.find(
    (p) => p.position_id === selectedVacancy
  );
  const duration = calculateDuration(project.start_date, project.end_date);

  // Get filled positions (team members)
  const filledPositions = project.positions.filter((p) => p.user_id !== null);

  async function handlePostular(
    user_id: number,
    position_id: number
  ): Promise<void> {
    const project_id = id;
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE}/project/postulate/${user_id}/${project_id}/${position_id}`
      );
      console.log("Postulation successful:", response.data);
      alert("Postulation submitted successfully!");

      // Update the project state to include the new postulation
      if (project) {
        const updatedProject = { ...project };
        // Find the position that was just postulated for
        const positionIndex = updatedProject.positions.findIndex(
          (pos) => pos.position_id === position_id
        );

        if (positionIndex !== -1) {
          // Initialize Postulations array if it doesn't exist
          if (!updatedProject.positions[positionIndex].Postulations) {
            updatedProject.positions[positionIndex].Postulations = [];
          }

          // Add the new postulation to the position
          updatedProject.positions[positionIndex].Postulations?.push({
            postulation_id: response.data.postulation_id || Date.now(), // Use response id or fallback
            user_id: user_id,
            Users: {
              user_id: user_id,
              name: session?.user?.name || "",
              mail: session?.user?.email || "",
            },
            Meeting: null,
          });

          // Update the project state
          setProject(updatedProject);
        }
      }
    } catch (error: any) {
      console.error("Error during postulation:", error);
      if (error.response && error.response.data && error.response.data.error) {
        alert(`Error: ${error.response.data.error}`);
      } else {
        alert("An error occurred during postulation. Please try again.");
      }
    }
  }

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
                  <strong>Duración: </strong> {duration}
                </p>
                <p className="text-sm text-secondary mb-2">
                  <strong>Delivery Lead:</strong> {project.details.capability}
                </p>
                <p className="text-sm text-secondary mb-2">
                  <strong>Empresa:</strong> {project.details.company}
                </p>
                <p className="text-sm text-secondary mb-2">
                  <strong>País:</strong> {project.details.country}
                </p>
                {project.description && (
                  <p className="text-sm text-secondary">
                    <strong>Descripción:</strong> {project.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Vacancies */}
          <div className="bg-base-100 rounded-lg shadow-md border border-base-300">
            <div className="card">
              <div className="card-title bg-primary text-primary-content p-4 rounded-t-lg">
                <h2 className="text-2xl font-bold">
                  Vacantes ({vacantPositions.length})
                </h2>
              </div>
              <div className="card-body p-6">
                {vacantPositions.length > 0 ? (
                  <>
                    <div className="form-control w-full mb-4">
                      <label className="label">
                        <span className="label-text">Seleccionar vacante</span>
                      </label>
                      <select
                        className="select select-bordered w-full"
                        value={selectedVacancy || ""}
                        onChange={(e) =>
                          setSelectedVacancy(Number(e.target.value))
                        }
                      >
                        {vacantPositions.map((position) => (
                          <option
                            key={position.position_id}
                            value={position.position_id}
                          >
                            {position.position_name}
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
                            <strong>Rol:</strong>{" "}
                            {selectedPosition.position_name}
                          </p>
                          <p className="text-sm text-secondary mt-2">
                            <strong>Descripción:</strong>{" "}
                            {selectedPosition.position_desc}
                          </p>
                        </div>

                        {loadingSkills ? (
                          <div className="flex justify-center py-4">
                            <span className="loading loading-spinner loading-md"></span>
                          </div>
                        ) : (
                          <>
                            {/* Skills Section */}
                            {selectedPosition.Project_Position_Skills &&
                              selectedPosition.Project_Position_Skills.length >
                                0 && (
                                <div>
                                  <h3 className="font-bold mb-2">
                                    Skills requeridos:
                                  </h3>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedPosition.Project_Position_Skills.map(
                                      (pps) => (
                                        <div
                                          key={pps.Skills.skill_id}
                                          className="badge badge-outline badge-primary"
                                        >
                                          {pps.Skills.skill_name ||
                                            pps.Skills.name}
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                            {/* Certificates Section */}
                            {selectedPosition.Project_Position_Certificates &&
                              selectedPosition.Project_Position_Certificates
                                .length > 0 && (
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
                          </>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-base-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <p className="text-base-300 mt-4">
                      No hay vacantes disponibles
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Team Members and Candidates Section */}
        <div className="col-span-2">
          {/* Current Team Section */}
          <div className="bg-base-100 p-6 rounded-lg shadow-md border border-base-300 mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">
              Equipo Actual ({filledPositions.length})
            </h2>

            {filledPositions.length > 0 ? (
              <div className="space-y-4 overflow-y-auto max-h-[calc(40vh-5rem)]">
                {filledPositions.map((position) => (
                  <div
                    key={position.position_id}
                    className="flex items-center justify-between bg-base-200 p-4 rounded-lg shadow-sm border border-base-300"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-primary">
                        {position.position_name}
                      </h3>
                      <p className="text-sm text-secondary">
                        {position.position_desc}
                      </p>
                    </div>
                    <div className="badge badge-success p-3">
                      Posición ocupada
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40">
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="text-base-300 mt-4">
                  No hay miembros asignados al equipo
                </p>
              </div>
            )}
          </div>

          {/* Candidates Section */}
          <div className="bg-base-100 p-6 rounded-lg shadow-md border border-base-300 overflow-y-auto max-h-[calc(55vh-5rem)]">
            <h2 className="text-2xl font-bold text-primary mb-4">
              Candidatos Disponibles ({candidates.length})
            </h2>

            {loadingTeam ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : candidates.length > 0 ? (
              <div className="space-y-4">
                {candidates.map((candidate) => (
                  <div
                    key={candidate.user_id}
                    className="collapse collapse-arrow bg-base-200 rounded-lg shadow-sm border border-base-300"
                  >
                    {/* Collapse Title */}
                    <input type="checkbox" />
                    <div className="collapse-title text-lg font-semibold text-primary flex justify-between items-center">
                      <span>{candidate.name}</span>
                      {/* Calculate percentage of matched skills and certificates */}
                      {(() => {
                        const totalRequiredSkills =
                          selectedPosition?.Project_Position_Skills?.length ||
                          0;
                        const totalRequiredCerts =
                          selectedPosition?.Project_Position_Certificates
                            ?.length || 0;
                        const totalRequired =
                          totalRequiredSkills + totalRequiredCerts;

                        const matchedSkillsCount =
                          candidate.matchedSkills?.length || 0;
                        const matchedCertsCount =
                          candidate.matchedCertificates?.length || 0;
                        const totalMatched =
                          matchedSkillsCount + matchedCertsCount;

                        const matchPercentage =
                          totalRequired > 0
                            ? (totalMatched / totalRequired) * 100
                            : 0;

                        // Check if user is already submitted
                        const isSubmitted =
                          selectedPosition?.Postulations?.some(
                            (postulation) =>
                              postulation.user_id === candidate.user_id
                          );

                        return (
                          <div className="flex flex-col items-end">
                            <span
                              className={`badge ${
                                matchPercentage >= 20
                                  ? "badge-success"
                                  : "badge-error"
                              }`}
                            >
                              {totalMatched} coincidencias
                            </span>
                            {isSubmitted && (
                              <span className="text-xs text-info mt-1">
                                Usuario ya postulado
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Collapse Content */}
                    <div className="collapse-content">
                      <p className="text-sm text-secondary mb-4">
                        {candidate.mail}
                      </p>

                      {/* Required Skills */}
                      {selectedPosition?.Project_Position_Skills &&
                        selectedPosition.Project_Position_Skills.length > 0 && (
                          <div className="flex justify-between">
                            <div className="mb-4">
                              <h3 className="font-bold mb-2">
                                Skills requeridos:
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {selectedPosition.Project_Position_Skills.map(
                                  (requiredSkill) => {
                                    const skillName =
                                      requiredSkill.Skills.skill_name ||
                                      requiredSkill.Skills.name;
                                    const hasSkill =
                                      candidate.matchedSkills?.some(
                                        (skill: Skill) =>
                                          (skill.skill_name || skill.name) ===
                                          skillName
                                      );
                                    return (
                                      <div
                                        key={requiredSkill.Skills.skill_id}
                                        className={`badge ${
                                          hasSkill
                                            ? "badge-success"
                                            : "badge-error"
                                        }`}
                                      >
                                        {skillName}
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                            {/* Calculate match percentage for postulation eligibility */}
                            {(() => {
                              const totalRequiredSkills = selectedPosition?.Project_Position_Skills?.length || 0;
                              const totalRequiredCerts = selectedPosition?.Project_Position_Certificates?.length || 0;
                              const totalRequired = totalRequiredSkills + totalRequiredCerts;
                              
                              const matchedSkillsCount = candidate.matchedSkills?.length || 0;
                              const matchedCertsCount = candidate.matchedCertificates?.length || 0;
                              const totalMatched = matchedSkillsCount + matchedCertsCount;
                              
                              const matchPercentage = totalRequired > 0 ? (totalMatched / totalRequired) * 100 : 0;
                              
                              // Check if user has already postulated for this position
                              if (selectedPosition.Postulations?.some(
                                (postulation) => postulation.user_id === candidate.user_id
                              )) {
                                return (
                                  <button
                                    className="btn btn-disabled btn-sm"
                                    disabled
                                  >
                                    Postulado
                                  </button>
                                );
                              } else if (matchPercentage < 20) {
                                // Prevent postulation if match percentage is less than 20%
                                return (
                                  <button
                                    className="btn btn-disabled btn-sm"
                                    disabled
                                    title="El candidato debe tener al menos 20% de coincidencias para ser postulado"
                                  >
                                    Coincidencia insuficiente
                                  </button>
                                );
                              } else {
                                return (
                                  <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() =>
                                      handlePostular(
                                        candidate.user_id,
                                        selectedPosition.position_id
                                      )
                                    }
                                  >
                                    Postular
                                  </button>
                                );
                              }
                            })()}
                          </div>
                        )}

                      {/* Required Certificates */}
                      {selectedPosition?.Project_Position_Certificates &&
                        selectedPosition.Project_Position_Certificates.length >
                          0 && (
                          <div>
                            <h3 className="font-bold mb-2">
                              Certificaciones requeridas:
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {selectedPosition.Project_Position_Certificates.map(
                                (requiredCert) => {
                                  const hasCertificate =
                                    candidate.matchedCertificates?.some(
                                      (cert: Certificate) =>
                                        cert.certificate_name ===
                                        requiredCert.Certificates
                                          .certificate_name
                                    );
                                  return (
                                    <div
                                      key={
                                        requiredCert.Certificates.certificate_id
                                      }
                                      className={`badge ${
                                        hasCertificate
                                          ? "badge-success"
                                          : "badge-error"
                                      }`}
                                    >
                                      {
                                        requiredCert.Certificates
                                          .certificate_name
                                      }
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedVacancy ? (
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="text-base-300 mt-4">
                  No hay candidatos disponibles para esta posición
                </p>
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
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-base-300 mt-4">
                  Seleccione una vacante para ver candidatos compatibles
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
