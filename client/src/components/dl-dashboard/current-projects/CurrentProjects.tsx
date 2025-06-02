"use client";

import { FaArrowDown, FaArrowUp, FaCalendarAlt } from "react-icons/fa";
import ProjectCardDL from "./ProjectCardDL";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import ModalFeedback from "../ModalFeedback";

type Project = {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  company: string;
};

const CurrentProjects = () => {
  const { data: session } = useSession();
  const [showCalendarInput, setShowCalendarInput] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const firstSixProjects = projects.slice(0, 6);
  const remainingProjects = projects.slice(6);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowCalendarInput(false);
      }
    };

    if (showCalendarInput) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendarInput]);

  const fetchProjects = async () => {
    try {
      const sessionId = session?.sessionId;
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE}/project/getCurrentProjectsDL`,
        { headers: { "session-key": sessionId } }
      );
      setProjects(response.data);
    } catch (error) {
      alert("Error al cargar los proyectos");
    }
  };

  const selectedProjectHandle = (project: Project) => {
    setSelectedProject(project);
  };

  useEffect(() => {
    fetchProjects();
  }, [session]);

  return (
    <div className="flex w-full bg-base-100 p-5 rounded-md border border-base-300 mb-6">
      <div className="w-full">
        <h2 className="text-3xl font-bold mb-4">Proyectos en Curso</h2>
        <div className="w-full h-px bg-base-300 mb-4"></div>
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
                daysRemaining={project.daysRemaining}
                percentCompletedDays={project.percentCompletedDays}
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
                    daysRemaining={project.daysRemaining}
                    percentCompletedDays={project.percentCompletedDays}
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
          <ModalFeedback project={selectedProject} toggleModal={toggleModal} />
        )}
      </div>
    </div>
  );
};

export default CurrentProjects;
