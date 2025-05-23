  import { useState, useEffect } from "react";
  import { IoMdAdd, IoMdClose, IoMdInformationCircle, IoMdInformationCircleOutline, IoIosArrowDown } from "react-icons/io";
  import { FaCalendarAlt } from "react-icons/fa";
  import { useSession } from "next-auth/react";
  import axios from "axios";
  import { PiTarget } from "react-icons/pi";

  interface Job {
    positionId: number;
    company: string;
    position: string;
    positionDesc: string;
    startDate: string;
    endDate: string;
    rawStart?: Date | null;
    rawEnd?: Date | null;
  }

  interface Project {
    projectName: string;
    company: string;
    positionName: string;
    projectDescription: string;
    startDate: string;
    endDate: string;
    feedbackDesc: string;
    feedbackScore: number | null;
    deliveryLeadName: string;
    skills: string[];
    rawStart?: Date | null;
    rawEnd?: Date | null;
  }

  // Create a new component for expandable project items
  const ExpandableProjectItem = ({ project }: { project: Project }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Function to render star rating (1-5 scale)
    const renderStars = (score: number | null) => {
      if (!score) return null;
      const normalizedScore = Math.min(5, Math.max(1, score)); // Ensure score is between 1-5
      const fullStars = Math.floor(normalizedScore);
      const hasHalfStar = normalizedScore % 1 >= 0.5;
      
      return (
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <span 
              key={i} 
              className={`text-${i < fullStars ? 'accent' : 'base-content/20'} text-lg`}
            >
              {i < fullStars ? '★' : i === fullStars && hasHalfStar ? '½' : '☆'}
            </span>
          ))}
        </div>
      );
    };

    return (
      <div className="mb-4 bg-base-100 rounded-lg border border-base-300 overflow-hidden">
        {/* Project header - always visible */}
        <div 
          className="flex justify-between items-center p-3 cursor-pointer hover:bg-base-200 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div>
            <h5 className="text-xl font-medium text-secondary">{project.projectName}</h5>
            <p className="text-sm font-bold text-base-content">{project.company}</p>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-accent mr-2">
              {project.startDate} - {project.endDate}
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        
        {/* Collapsible content */}
        {isExpanded && (
          <div className="bg-base-200 border-t border-base-300 p-4">
            <div className="flex mb-4">
              {/* Left Column */}
              <div className="w-1/2 pr-4 border-r border-base-300">
                <p className="text-base-content font-medium mb-2">
                  {project.positionName}
                </p>
                <p className="text-secondary mb-4">
                  {project.projectDescription}
                </p>
                
                {project.skills.length > 0 && (
                  <div>
                    <div className="flex flex-wrap gap-1">
                      {project.skills.map((skill, sIndex) => (
                        <span key={sIndex} className="badge badge-outline badge-sm border-base-300 border-2">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Right Column */}
              <div className="w-1/2 pl-4">
                {project.feedbackDesc && (
                  <p className="text-base-content mb-2">
                    "{project.feedbackDesc}"
                  </p>
                )}
                <p className="font-bold text-base-content text-sm">
                  - {project.deliveryLeadName}
                </p>
                {project.feedbackScore && (
                  <div className="mt-2">
                    {renderStars(project.feedbackScore)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const WidgetTrayectoriaColegas = ({ userId }: { userId: number }) => {

    const { data: session } = useSession();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddExperienceModalOpen, setIsAddExperienceModalOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);

    const [experienceForm, setExperienceForm] = useState({
      company: "",
      position_name: "",
      position_desc: "",
      start_date: "",
      end_date: "",
    });
    
    const [formErrors, setFormErrors] = useState({
      company: "",
      position_name: "",
      start_date: "",
      end_date: "",
    });
  
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [isEditExperienceModalOpen, setIsEditExperienceModalOpen] = useState(false);
    const [currentJob, setCurrentJob] = useState<Job | null>(null);
  

    // Group projects by job period and sort them by start date
    const getProjectsForJob = (job: Job) => {
      const filteredProjects = projects.filter(project => {
        const jobStart = job.rawStart ? new Date(job.rawStart) : new Date(0);
        const jobEnd = job.rawEnd ? new Date(job.rawEnd) : new Date();
        const projectStart = project.rawStart ? new Date(project.rawStart) : new Date(0);
        const projectEnd = project.rawEnd ? new Date(project.rawEnd) : new Date();
        
        // Check if project overlaps with job period
        return (
          (projectStart >= jobStart && projectStart <= jobEnd) ||
          (projectEnd >= jobStart && projectEnd <= jobEnd) ||
          (projectStart <= jobStart && projectEnd >= jobEnd)
        );
      });

      // Sort projects by start date (oldest first)
      return filteredProjects.sort((a, b) => {
        const dateA = a.rawStart ? new Date(a.rawStart).getTime() : 0;
        const dateB = b.rawStart ? new Date(b.rawStart).getTime() : 0;
        return dateA - dateB;
      });
    };

    // Fetch all jobs and projects
    const fetchAll = async () => {
      try {
        const sessionId = session?.sessionId;
        if (!sessionId) {
          console.error("Session ID is missing");
          return;
        }
    
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/employee/experience?userId=${userId}`);

    
        if (res.status === 401) {
          console.error("Session expired or invalid. Redirecting to login...");
          localStorage.removeItem("sessionId"); 
          window.location.href = "/login"; 
          return;
        }
    
        setJobs(res.data.jobs);
        setProjects(res.data.projects);

        //console.log("Fetched Jobs:", res.data.jobs); // Log jobs to the console
        //console.log("Fetched Projects:", res.data.projects); // Log projects to the console
      } catch (error) {
        console.error("Error fetching experience data:", error);
      }
    };

    // agregar proyecto
    // Función para validar el formulario
    const validateForm = () => {
      let valid = true;
      const newErrors = {
        company: "",
        position_name: "",
        start_date: "",
        end_date: "",
      };

      if (!experienceForm.company.trim()) {
        newErrors.company = "El nombre de la empresa es requerido";
        valid = false;
      }

      if (!experienceForm.position_name.trim()) {
        newErrors.position_name = "El nombre del puesto es requerido";
        valid = false;
      }

      if (!experienceForm.start_date) {
        newErrors.start_date = "La fecha de inicio es requerida";
        valid = false;
      }

      if (!experienceForm.end_date) {
        newErrors.end_date = "La fecha de finalización es requerida";
        valid = false;
      } else if (experienceForm.start_date && experienceForm.end_date) {
        const startDate = new Date(experienceForm.start_date);
        const endDate = new Date(experienceForm.end_date);
        
        if (startDate > endDate) {
          newErrors.end_date = "La fecha de finalización debe ser posterior a la fecha de inicio";
          valid = false;
        }
      }

      setFormErrors(newErrors);
      return valid;
    };

    // Función para enviar la experiencia al backend
    const submitExperience = async () => {
      setIsSubmitting(true);
      setSubmitError("");
      setSubmitSuccess(false);

      try {
        const sessionId = session?.sessionId;
        if (!sessionId) {
          throw new Error("Session ID is missing");
        }

        // Convertir fechas a formato ISO y añadir timezone si es necesario
        const formattedExperience = {
          ...experienceForm,
          start_date: new Date(experienceForm.start_date).toISOString(),
          end_date: new Date(experienceForm.end_date).toISOString(),
        };

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE}/employee/addExperience`,
          formattedExperience,
          {
            headers: { "session-key": sessionId },
          }
        );

        if (response.status === 201) {
          setSubmitSuccess(true);
          setExperienceForm({
            company: "",
            position_name: "",
            position_desc: "",
            start_date: "",
            end_date: "",
          });
          setFormErrors({
            company: "",
            position_name: "",
            start_date: "",
            end_date: "",
          });
          setSubmitError("");
          // Actualizar la lista de trabajos
          fetchAll();
          // Cerrar el modal después de 1.5 segundos
          setTimeout(() => {
            setIsAddExperienceModalOpen(false);
            setSubmitSuccess(false);
          }, 1500);
        }
      } catch (error) {
        console.error("Error submitting experience:", error);
        setSubmitError(
          error.response?.data?.message || 
          "Error al guardar la experiencia. Por favor, inténtalo de nuevo."
        );
      } finally {
        setIsSubmitting(false);
      }
    };

    const [trees] = useState(() => {
      const treePositions = [];
      const treeTypes = ['tree-1', 'tree-2'];
      const sections = 4;
      
      for (let i = 0; i < sections; i++) {
        const sectionWidth = 80 / sections;
        const minLeft = 10 + (i * sectionWidth);
        
        treePositions.push({
          type: treeTypes[Math.floor(Math.random() * treeTypes.length)],
          left: minLeft + (Math.random() * sectionWidth),
          top: 5 + (Math.random() * 25),
          bottom: 'auto'
        });
        
        treePositions.push({
          type: treeTypes[Math.floor(Math.random() * treeTypes.length)],
          left: minLeft + (Math.random() * sectionWidth),
          top: 'auto',
          bottom: 5 + (Math.random() * 25)
        });
      }
      
      return treePositions;
    });

    const updateExperience = async (positionId: number) => {
      setIsSubmitting(true);
      setSubmitError("");
      setSubmitSuccess(false);
    
      try {
        const sessionId = session?.sessionId;
        if (!sessionId) {
          throw new Error("Session ID is missing");
        }
    
        const formattedExperience = {
          ...experienceForm,
          start_date: new Date(experienceForm.start_date).toISOString(),
          end_date: new Date(experienceForm.end_date).toISOString(),
        };
    
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_API_BASE}/employee/updateExperience/${positionId}`,
          formattedExperience,
          {
            headers: { "session-key": sessionId },
          }
        );
    
        if (response.status === 200) {
          setSubmitSuccess(true);
          setSubmitError("");
          // Update the jobs list
          fetchAll();
          // Close the modal after 1.5 seconds
          setTimeout(() => {
            setIsEditExperienceModalOpen(false);
            setSubmitSuccess(false);
          }, 1500);
        }
      } catch (error) {
        console.error("Error updating experience:", error);
        setSubmitError(
          error.response?.data?.message || 
          "Error al actualizar la experiencia. Por favor, inténtalo de nuevo."
        );
      } finally {
        setIsSubmitting(false);
      }
    };


    const handleModalToggle = () => {
      setIsModalOpen(!isModalOpen);
    };

    const handleDropdownToggle = () => {
      setIsDropdownOpen(!isDropdownOpen);
    };
  
    const handleViewDetails = () => {
      setIsDropdownOpen(false);
      setIsModalOpen(true);
    };
  
    const handleAddExperience = () => {
      setIsDropdownOpen(false);
      setIsAddExperienceModalOpen(true);
    };

    // Función para manejar el envío del formulario
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (validateForm()) {
        await submitExperience();
      }
    };

    const handleEditExperience = (job: Job) => {
      setCurrentJob(job);
      setExperienceForm({
        company: job.company,
        position_name: job.position,
        position_desc: job.positionDesc,
        start_date: job.startDate,
        end_date: job.endDate,
      });
      setIsEditExperienceModalOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!currentJob) return;
      
      if (validateForm()) {
        await updateExperience(currentJob.positionId);
      }
    };
    
    const handleDeleteExperience = async (positionId: number) => {
      if (!confirm("¿Estás seguro de que deseas eliminar esta experiencia?")) {
        return;
      }
    
      setIsSubmitting(true);
      setSubmitError("");
      setSubmitSuccess(false);
    
      try {
        const sessionId = session?.sessionId;
        if (!sessionId) {
          throw new Error("Session ID is missing");
        }
    
        const response = await axios.delete(
          `${process.env.NEXT_PUBLIC_API_BASE}/employee/deleteExperience/${positionId}`,
          {
            headers: { "session-key": sessionId },
          }
        );
    
        if (response.status === 200) {
          setSubmitSuccess(true);
          setSubmitError("");
          // Update the jobs list
          fetchAll();
          // Close the modal after 1.5 seconds
          setTimeout(() => {
            setIsEditExperienceModalOpen(false);
            setSubmitSuccess(false);
          }, 1500);
        }
      } catch (error) {
        console.error("Error deleting experience:", error);
        setSubmitError(
          error.response?.data?.message || 
          "Error al eliminar la experiencia. Por favor, inténtalo de nuevo."
        );
      } finally {
        setIsSubmitting(false);
      }
    };


    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (isDropdownOpen) {
          const target = event.target as HTMLElement;
          if (!target.closest('.dropdown-container')) {
            setIsDropdownOpen(false);
          }
        }
      };
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isDropdownOpen]);

    // Efecto para limpiar errores cuando se cierra el modal
    useEffect(() => {
      if (!isAddExperienceModalOpen && !isEditExperienceModalOpen) {
        setFormErrors({
          company: "",
          position_name: "",
          start_date: "",
          end_date: "",
        });
        setExperienceForm({
          company: "",
          position_name: "",
          position_desc: "",
          start_date: "",
          end_date: "",
        });
        setCurrentJob(null);
        setSubmitError("");
        setSubmitSuccess(false);
      }
    }, [isAddExperienceModalOpen, isEditExperienceModalOpen]);

    useEffect(() => {
      fetchAll();
    }, []);

    return (
      <div className="card w-full h-full min-h-[350px]">
        <div className="p-3 md:p-4 bg-base-100 rounded-lg border border-base-300 h-full flex flex-col">
          {/* Header */}
          <div className="flex flex-row w-full gap-x-2 mb-2 items-center">
            <h2 className="card-title text-3xl">
              <PiTarget />
              Trayectoria
            </h2>
            
            {/* Dropdown container */}
            <div className="dropdown-container relative ml-auto">
              <button
                className="btn btn-circle btn-accent btn-xs md:btn-sm text-base-100"
                onClick={handleDropdownToggle}
              >
                <IoIosArrowDown className={`text-lg md:text-xl transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-base-100 rounded-md shadow-lg border border-base-300 z-50">
                  <div className="py-1">
                    <button
                      onClick={handleViewDetails}
                      className="flex items-center px-4 py-2 text-sm text-base-content hover:bg-base-200 w-full text-left cursor-pointer"
                    >
                      <IoMdInformationCircle className="mr-2 text-primary" />
                      Ver detalles
                    </button>
                    
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timeline container */}
          <div className="flex-1 relative bg-base-200 rounded-lg overflow-hidden min-h-[250px] mb-4">
            {/* Road */}
            <div className="absolute top-1/2 left-0 right-0 h-6 md:h-8 transform -translate-y-1/2 z-0 bg-[#464F5D]">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 transform -translate-y-1/2 flex justify-around">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-6 md:w-10 h-full bg-white mx-2 md:mx-4" 
                    style={{
                      marginLeft: i === 0 ? '0.5rem' : undefined,
                      marginRight: i === 4 ? '0.5rem' : undefined
                    }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Trees */}
            {trees.map((tree, index) => (
              <div 
                key={index}
                className="absolute w-5 h-5 md:w-7 md:h-7 z-10"
                style={{
                  left: `${tree.left}%`,
                  top: tree.top !== 'auto' ? `${tree.top}%` : undefined,
                  bottom: tree.bottom !== 'auto' ? `${tree.bottom}%` : undefined,
                }}
              >
                <img 
                  src={`/trayectoria/${tree.type}.svg`} 
                  alt="Tree" 
                  className="w-full h-full"
                />
              </div>
            ))}

            {/* Timeline content */}
            <div className="absolute inset-0 overflow-x-auto overflow-y-hidden">
              <div 
                className="relative h-full"
                style={{ minWidth: `${Math.max(jobs.length * 180, 500)}px` }}
              >
                {jobs.map((job, index) => (
                  <div 
                    key={index}
                    className="absolute flex flex-col items-center"
                    style={{
                      left: `${(index + 0.5) * (100 / jobs.length)}%`,
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 20,
                    }}
                  >
                    {/* Building icons */}
                    <div className="mt-4 md:mt-5 mb-3 md:mb-4 w-9 h-9 md:w-12 md:h-12">
                      <img
                        src={job.company === "Accenture" 
                          ? "/trayectoria/Accenture.png" 
                          : "/trayectoria/building.svg"}
                        alt={job.company}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Dot */}
                    <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-accent border border-white shadow"></div>

                    {/* Job card */}
                    <div className="mt-2 md:mt-3 bg-base-100 p-1.5 md:p-2 rounded border border-base-300 shadow-sm w-40 md:w-48 text-center">
                      <h3 className="text-sm md:text-md font-semibold text-secondary">{job.company}</h3>
                      <p className="text-xs md:text-sm">{job.position}</p>
                      <p className="text-xs mt-0 text-accent">
                        {job.startDate} - {job.endDate}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Details Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-1">
            <div
              className="flex flex-col bg-base-100 rounded-lg shadow-lg w-full max-w-[60vw] max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-4 border-b bg-base-100">
                <h2 className="text-2xl font-bold">Trayectoria Completa</h2>
                <button 
                  onClick={handleModalToggle}
                  className="btn btn-circle btn-ghost btn-sm"
                >
                  <IoMdClose className="text-xl" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-4 bg-base-100">
                {jobs.map((job, index) => {
                  const jobProjects = getProjectsForJob(job);
                  return (
                    <div key={index} className="mb-8 last:mb-0">
                      {/* Job Section */}
                      <div className="flex items-center gap-4 mb-4 p-4 bg-base-100 rounded-lg">
                        <div className="w-18 h-18 flex-shrink-0 bg-base-200 rounded-lg flex items-center justify-center border">
                          <img
                            src={job.company === "Accenture" 
                              ? "/trayectoria/Accenture.png" 
                              : "/trayectoria/building.svg"}
                            alt={job.company}
                            className="w-12 h-12 object-contain"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-semibold">{job.company}</h3>
                              <div className="flex items-center gap-2">
                                <p className="text-lg">{job.position}</p>
                                {job.positionDesc && (
                                  <div className="group relative inline-block">
                                    <button className="text-primary focus:outline-none">
                                      <IoMdInformationCircleOutline className="text-lg" />
                                    </button>
                                    <div className="absolute left-full ml-2 hidden group-hover:block w-64 bg-base-200 border border-base-300 rounded-lg shadow-lg p-3 z-50">
                                      <p className="text-sm text-base-content">{job.positionDesc}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-accent">
                                {job.startDate} - {job.endDate}
                              </p>
                            </div>                            
                          </div>
                        </div>
                      </div>

                      {/* Projects Section */}
                      {jobProjects.length > 0 ? (
                        <div className="ml-16 pl-4 border-l-2 border-base-300">
                          {jobProjects.map((project, pIndex) => (
                            <ExpandableProjectItem key={pIndex} project={project} />
                          ))}
                        </div>
                      ) : (
                        <div className="ml-16 pl-4 text-sm text-base-content/70">
                          No hay proyectos registrados para este periodo.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end p-4 border-t bg-base-100">
                <button
                  className="btn btn-primary"
                  onClick={handleModalToggle}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de agregar rxperiencia */}
        {isAddExperienceModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-1">
            <div
              className="flex flex-col bg-base-100 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-4 border-b bg-base-100">
                <h2 className="text-2xl font-bold">Agregar Nueva Experiencia</h2>
                <button 
                  onClick={() => setIsAddExperienceModalOpen(false)}
                  className="btn btn-circle btn-ghost btn-sm"
                  disabled={isSubmitting}
                >
                  <IoMdClose className="text-xl" />
                </button>
              </div>

              {/* Modal Content */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 bg-base-100">
                {/* Mensajes de éxito/error */}
                {submitSuccess && (
                  <div className="alert alert-success mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>¡Experiencia guardada con éxito!</span>
                  </div>
                )}
                
                {submitError && (
                  <div className="alert alert-error mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Empresa */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Empresa*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nombre de la empresa"
                      className={`input input-bordered w-full ${formErrors.company ? 'input-error' : ''}`}
                      value={experienceForm.company}
                      onChange={(e) => setExperienceForm({
                        ...experienceForm,
                        company: e.target.value
                      })}
                      disabled={isSubmitting}
                    />
                    {formErrors.company && (
                      <label className="label">
                        <span className="label-text-alt text-error">{formErrors.company}</span>
                      </label>
                    )}
                  </div>

                  {/* Puesto */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Puesto*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nombre del puesto"
                      className={`input input-bordered w-full ${formErrors.position_name ? 'input-error' : ''}`}
                      value={experienceForm.position_name}
                      onChange={(e) => setExperienceForm({
                        ...experienceForm,
                        position_name: e.target.value
                      })}
                      disabled={isSubmitting}
                    />
                    {formErrors.position_name && (
                      <label className="label">
                        <span className="label-text-alt text-error">{formErrors.position_name}</span>
                      </label>
                    )}
                  </div>

                  {/* Fechas */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Fecha de inicio*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        className={`input input-bordered w-full${formErrors.start_date ? 'input-error' : ''}`}
                        value={experienceForm.start_date}
                        onChange={(e) => setExperienceForm({
                          ...experienceForm,
                          start_date: e.target.value
                        })}
                        disabled={isSubmitting}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <FaCalendarAlt className="text-gray-400" />
                      </div>
                    </div>
                    {formErrors.start_date && (
                      <label className="label">
                        <span className="label-text-alt text-error">{formErrors.start_date}</span>
                      </label>
                    )}
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Fecha de finalización*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        className={`input input-bordered w-full ${formErrors.end_date ? 'input-error' : ''}`}
                        value={experienceForm.end_date}
                        onChange={(e) => setExperienceForm({
                          ...experienceForm,
                          end_date: e.target.value
                        })}
                        disabled={isSubmitting}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <FaCalendarAlt className="text-gray-400" />
                      </div>
                    </div>
                    {formErrors.end_date && (
                      <label className="label">
                        <span className="label-text-alt text-error">{formErrors.end_date}</span>
                      </label>
                    )}
                  </div>

                  {/* Descripción */}
                  <div className="form-control md:col-span-2">
                    <label className="label">
                      <span className="label-text">Descripción del puesto</span>
                    </label>
                    <textarea
                      placeholder="Describe tus responsabilidades y logros"
                      className="textarea textarea-bordered w-full h-24"
                      value={experienceForm.position_desc}
                      onChange={(e) => setExperienceForm({
                        ...experienceForm,
                        position_desc: e.target.value
                      })}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end p-4 border-t bg-base-100 gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setIsAddExperienceModalOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="loading loading-spinner"></span>
                        Guardando...
                      </>
                    ) : (
                      "Guardar Experiencia"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Modal de editar experiencia */}
        {isEditExperienceModalOpen && currentJob && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-1">
            <div
              className="flex flex-col bg-base-100 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-4 border-b bg-base-100">
                <h2 className="text-2xl font-bold">Editar Experiencia</h2>
                <button 
                  onClick={() => setIsEditExperienceModalOpen(false)}
                  className="btn btn-circle btn-ghost btn-sm"
                  disabled={isSubmitting}
                >
                  <IoMdClose className="text-xl" />
                </button>
              </div>

              {/* Modal Content */}
              <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 bg-base-100">
                {/* Mensajes de éxito/error */}
                {submitSuccess && (
                  <div className="alert alert-success mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>¡Experiencia actualizada con éxito!</span>
                  </div>
                )}
                
                {submitError && (
                  <div className="alert alert-error mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Empresa */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Empresa*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nombre de la empresa"
                      className={`input input-bordered w-full ${formErrors.company ? 'input-error' : ''}`}
                      value={experienceForm.company}
                      onChange={(e) => setExperienceForm({
                        ...experienceForm,
                        company: e.target.value
                      })}
                      disabled={isSubmitting}
                    />
                    {formErrors.company && (
                      <label className="label">
                        <span className="label-text-alt text-error">{formErrors.company}</span>
                      </label>
                    )}
                  </div>

                  {/* Puesto */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Puesto*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nombre del puesto"
                      className={`input input-bordered w-full ${formErrors.position_name ? 'input-error' : ''}`}
                      value={experienceForm.position_name}
                      onChange={(e) => setExperienceForm({
                        ...experienceForm,
                        position_name: e.target.value
                      })}
                      disabled={isSubmitting}
                    />
                    {formErrors.position_name && (
                      <label className="label">
                        <span className="label-text-alt text-error">{formErrors.position_name}</span>
                      </label>
                    )}
                  </div>

                  {/* Fechas */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Fecha de inicio*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        className={`input input-bordered w-full ${formErrors.start_date ? 'input-error' : ''}`}
                        value={experienceForm.start_date}
                        onChange={(e) => setExperienceForm({
                          ...experienceForm,
                          start_date: e.target.value
                        })}
                        disabled={isSubmitting}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <FaCalendarAlt className="text-gray-400" />
                      </div>
                    </div>
                    {formErrors.start_date && (
                      <label className="label">
                        <span className="label-text-alt text-error">{formErrors.start_date}</span>
                      </label>
                    )}
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Fecha de finalización*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        className={`input input-bordered w-full ${formErrors.end_date ? 'input-error' : ''}`}
                        value={experienceForm.end_date}
                        onChange={(e) => setExperienceForm({
                          ...experienceForm,
                          end_date: e.target.value
                        })}
                        disabled={isSubmitting}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <FaCalendarAlt className="text-gray-400" />
                      </div>
                    </div>
                    {formErrors.end_date && (
                      <label className="label">
                        <span className="label-text-alt text-error">{formErrors.end_date}</span>
                      </label>
                    )}
                  </div>

                  {/* Descripción */}
                  <div className="form-control md:col-span-2">
                    <label className="label">
                      <span className="label-text">Descripción del puesto</span>
                    </label>
                    <textarea
                      placeholder="Describe tus responsabilidades y logros"
                      className="textarea textarea-bordered w-full h-24"
                      value={experienceForm.position_desc}
                      onChange={(e) => setExperienceForm({
                        ...experienceForm,
                        position_desc: e.target.value
                      })}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end p-4 border-t bg-base-100 gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setIsEditExperienceModalOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="loading loading-spinner"></span>
                        Guardando...
                      </>
                    ) : (
                      "Actualizar Experiencia"
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-error"
                    onClick={() => handleDeleteExperience(currentJob.positionId)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="loading loading-spinner"></span>
                        Eliminando...
                      </>
                    ) : (
                      "Eliminar"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>  
    );
  };

  export default WidgetTrayectoriaColegas;
