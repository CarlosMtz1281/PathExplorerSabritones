import { useState, useEffect } from "react";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import { useSession } from "next-auth/react";
import axios from "axios";
import { PiTarget } from "react-icons/pi";

interface Job {
  company: string;
  position: string;
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

const WidgetTrayectoria = ({ userId }: { userId?: number }) => {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

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

  const fetchAll = async () => {
    try {
      if (userId) {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/employee/experience?userId=${userId}`);
        setJobs(res.data.jobs);
        setProjects(res.data.projects);
        return;
      }
  
      const sessionId = session?.sessionId;
      if (!sessionId) {
        console.error("Session ID is missing");
        return;
      }
  
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/employee/experience`, {
        headers: { "session-key": sessionId },
      });
  
      setJobs(res.data.jobs);
      setProjects(res.data.projects);
    } catch (error) {
      console.error("Error fetching experience data:", error);
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

  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };

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
          <button
            className="btn btn-circle btn-accent btn-xs md:btn-sm ml-auto text-base-100"
            onClick={handleModalToggle}
          >
            <IoMdAdd className="text-lg md:text-xl" />
          </button>
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

      {/* Enhanced Modal */}
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
                    {/* Job Section - Only the icon has bg-base-200 */}
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
                      <div>
                        <h3 className="text-xl font-semibold">{job.company}</h3>
                        <p className="text-lg">{job.position}</p>
                        <p className="text-sm text-accent">
                          {job.startDate} - {job.endDate}
                        </p>
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
    </div>  
  );
};

export default WidgetTrayectoria;