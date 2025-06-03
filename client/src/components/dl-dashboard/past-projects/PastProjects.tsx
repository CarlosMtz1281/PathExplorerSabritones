"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import ProjectCardDL from "../current-projects/ProjectCardDL";
import {
  FaArrowDown,
  FaArrowUp,
  FaCalendarAlt,
  FaChevronDown,
  FaChevronUp,
  FaFilter,
} from "react-icons/fa";
import ModalFeedback from "../ModalFeedback";

type Project = {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  company: string;
  country: string;
  people: number;
  feedbacks: number;
  toggleModal: () => void;
  closed: boolean;
};

const CurrentProjects = () => {
  const { data: session } = useSession();
  const [showProjects, setShowProjects] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setshowFilters] = useState(false);

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [openFecha, setOpenFecha] = useState(true);
  const [openFeedback, setOpenFeedback] = useState(true);
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [feedbackFilter, setFeedbackFilter] = useState<"all" | "sin" | "con">(
    "all"
  );

  const firstSixProjects = filteredProjects.slice(0, 6);
  const remainingProjects = filteredProjects.slice(6);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const selectedProjectHandle = (project: Project) => {
    setSelectedProject(project);
  };

  const fetchProjects = async () => {
    try {
      const sessionId = session?.sessionId || "";
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE}/project/getPastProjectsDL`,
        {
          headers: { "session-key": sessionId },
        }
      );
      setProjects(response.data);
    } catch (error) {
      alert("Error al cargar los proyectos");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setshowFilters(false);
        setOpenFecha(true);
        setOpenFeedback(true);
      }
    };

    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilters]);

  useEffect(() => {
    fetchProjects();
  }, [session]);

  const parseDMY = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split("/").map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed
  };

  const applyFilters = () => {
    let filtered = [...projects];

    // Feedback filter
    if (feedbackFilter === "sin") {
      filtered = filtered.filter((p) => p.feedbacks < p.people);
    } else if (feedbackFilter === "con") {
      filtered = filtered.filter((p) => p.feedbacks >= p.people);
    }

    // Convert string dates to timestamps for accurate comparison
    const startTimestamp = startDate ? new Date(startDate).getTime() : null;
    const endTimestamp = endDate ? new Date(endDate).getTime() : null;

    filtered = filtered.filter((p) => {
      const projectStart = new Date(parseDMY(p.start_date)).getTime();
      const projectEnd = new Date(parseDMY(p.end_date)).getTime();

      if (startTimestamp && endTimestamp) {
        return projectStart >= startTimestamp && projectEnd <= endTimestamp;
      } else if (startTimestamp) {
        return projectStart >= startTimestamp;
      } else if (endTimestamp) {
        return projectEnd <= endTimestamp;
      }
      return true; // no date filter
    });

    // Search filter
    if (searchValue.trim()) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    setFilteredProjects(filtered);
  };

  useEffect(() => {
    applyFilters(); // Re-run filters dynamically on search change
  }, [searchValue, projects]);

  return (
    <div className="flex w-full bg-base-100 p-5 rounded-md border border-base-300 mb-6">
      <div className="w-full">
        <h2 className="text-3xl font-bold mb-4">Proyectos Pasados</h2>
        <div className="w-full h-px bg-base-300 mb-4" />
        <div className="flex flex-row w-full h-14 px-8 mb-4">
          <input
            type="text"
            placeholder="Buscar..."
            className="input input-bordered h-full w-full py-4.5 border-primary text-primary placeholder:text-primary text-base outline-none focus:outline-none"
            style={{
              backgroundColor: "oklch(from var(--color-accent) l c h / 30%)",
            }}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <div className="relative inline-block " ref={dropdownRef}>
            <button
              className={
                "border border-primary text-start text-primary w-full ml-4 h-full pl-4 rounded-lg hover:cursor-pointer transition-colors duration-300" +
                (showFilters ? " border-0" : "")
              }
              style={{
                backgroundColor: showFilters
                  ? "oklch(from var(--color-secondary) l c h)"
                  : "oklch(from var(--color-accent) l c h / 30%)",
              }}
              onClick={() => {
                setshowFilters(!showFilters);
                if (openFecha === false) setOpenFecha(true);
                if (openFeedback === false) setOpenFeedback(true);
              }}
            >
              <FaFilter
                className={
                  "text-lg text-primary" +
                  (showFilters ? " text-secondary-content" : "")
                }
              />
            </button>
            {showFilters && (
              <div className="absolute right-12 -top-64 mt-2 z-20 w-80 p-4 bg-white rounded-lg border border-base-300 drop-shadow-lg">
                <div className="flex flex-col gap-6 py-1">
                  <div className="flex items-center justify-center border-b-1 border-base-300">
                    <p className="font-bold mb-3 text-lg text-primary">
                      Añadir Filtros
                    </p>
                  </div>
                  {/* Resultados Dropdown */}
                  <div className="border-b-1 border-base-300 pb-5">
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setOpenFeedback(!openFeedback)}
                    >
                      <p className="font-bold text-primary text-md">
                        Resultados
                      </p>
                      {openFeedback ? (
                        <FaChevronUp className="text-xs text-primary transition-all duration-300" />
                      ) : (
                        <FaChevronUp className="text-xs text-primary rotate-180 transition-all duration-300" />
                      )}
                    </div>
                    <div
                      className={`transition-all duration-500 ease-in-out overflow-hidden ${
                        openFeedback
                          ? "max-h-40 opacity-100 mt-4"
                          : "max-h-0 opacity-0 mt-0"
                      } pl-3 flex flex-col gap-2`}
                    >
                      <div>
                        <input
                          type="radio"
                          name="radio-1"
                          className="radio radio-primary radio-xs"
                          checked={feedbackFilter === "all"}
                          onChange={() => setFeedbackFilter("all")}
                        />
                        <span className="ml-2 text-sm text-gray-600">
                          Todos
                        </span>
                      </div>
                      <div>
                        <input
                          type="radio"
                          name="radio-1"
                          className="radio radio-primary radio-xs"
                          checked={feedbackFilter === "sin"}
                          onChange={() => setFeedbackFilter("sin")}
                        />
                        <span className="ml-2 text-sm text-gray-600">
                          Sin Feedback
                        </span>
                      </div>
                      <div>
                        <input
                          type="radio"
                          name="radio-1"
                          className="radio radio-primary radio-xs"
                          checked={feedbackFilter === "con"}
                          onChange={() => setFeedbackFilter("con")}
                        />
                        <span className="ml-2 text-sm text-gray-600">
                          Con Feedback
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Fecha Dropdown */}
                  <div className="border-b-1 border-base-300 pb-5">
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setOpenFecha(!openFecha)}
                    >
                      <p className="font-bold text-primary text-md">Fecha</p>
                      {openFecha ? (
                        <FaChevronUp className="text-xs text-primary transition-all duration-300" />
                      ) : (
                        <FaChevronUp className="text-xs text-primary rotate-180 transition-all duration-300" />
                      )}
                    </div>
                    <div
                      className={`transition-all duration-500 ease-in-out overflow-hidden ${
                        openFecha
                          ? "max-h-55 opacity-100 overflow-visible mt-4"
                          : "max-h-0 opacity-0 overflow-hidden mt-0"
                      } pl-3 flex flex-col`}
                    >
                      <label className="block mb-2 text-sm font-medium text-gray-600">
                        Desde
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          className="input input-bordered w-full mb-4 focus:outline-none focus:ring-0 focus:shadow-none"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                        <div className="absolute right-3 top-3/8 -translate-y-1/2 pointer-events-none">
                          <FaCalendarAlt className="text-gray-400 text-xl" />
                        </div>
                      </div>

                      <label className="block mb-2 text-sm font-medium text-gray-600">
                        Hasta
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          className="input input-bordered w-full"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <FaCalendarAlt className="text-gray-400 text-xl" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      className="btn btn-primary w-full"
                      onClick={() => {
                        applyFilters();
                        setOpenFecha(true);
                        setOpenFeedback(true);
                        setshowFilters(false);
                      }}
                    >
                      Aplicar Filtros
                    </button>
                    <button
                      className="btn btn-base-200 w-full"
                      onClick={() => {
                        setStartDate("");
                        setEndDate("");
                        setFeedbackFilter("all");
                        setSearchValue("");
                        setFilteredProjects(projects);
                        setOpenFecha(true);
                        setOpenFeedback(true);
                        setshowFilters(false);
                      }}
                    >
                      Borrar Filtros
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {firstSixProjects.map((project, index) => (
            <div
              className="w-full"
              key={index}
              onClick={() => selectedProjectHandle(project)}
            >
              <ProjectCardDL
                name={project.name}
                description={project.description}
                start_date={project.start_date}
                end_date={project.end_date}
                country={project.country}
                company={project.company}
                people={project.people}
                feedbacks={project.feedbacks}
                closed={true}
                toggleModal={toggleModal}
              />
            </div>
          ))}
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              showProjects
                ? "max-h-screen opacity-100 overflow-visible"
                : "max-h-0 opacity-0 overflow-hidden"
            }`}
          >
            {showProjects &&
              remainingProjects.map((project, index) => (
                <div key={index} className="w-full">
                  <ProjectCardDL
                    name={project.name}
                    description={project.description}
                    start_date={project.start_date}
                    end_date={project.end_date}
                    country={project.country}
                    company={project.company}
                    people={project.people}
                    feedbacks={project.feedbacks}
                    closed={true}
                    toggleModal={toggleModal}
                  />
                </div>
              ))}
          </div>
        </div>

        {remainingProjects.length > 0 && (
          <div className="flex items-center justify-center w-full">
            <button
              className="btn btn-circle btn-accent"
              onClick={() => setShowProjects(!showProjects)}
            >
              {showProjects ? (
                <FaArrowUp className="text-base-100" />
              ) : (
                <FaArrowDown className="text-base-100" />
              )}
            </button>
          </div>
        )}
        {showModal && (
          <ModalFeedback
            project={selectedProject}
            toggleModal={toggleModal}
            closed={true}
          />
        )}
      </div>
    </div>
  );
};

export default CurrentProjects;
