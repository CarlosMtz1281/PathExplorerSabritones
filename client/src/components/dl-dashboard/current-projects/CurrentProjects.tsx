"use client";

import { FaArrowDown, FaArrowUp, FaCalendarAlt } from "react-icons/fa";
import ProjectCardDL from "./ProjectCardDL";
import { useState, useEffect, useRef } from "react";

const CurrentProjects = () => {
  const [showCalendarInput, setShowCalendarInput] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showModal, setShowModal] = useState(false);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const projects = [<ProjectCardDL toggleModal={toggleModal} />];

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

  return (
    <div className="flex w-full bg-base-100 p-5 rounded-md border border-base-300 mb-6">
      <div className="w-full">
        <h2 className="text-3xl font-bold mb-4">Futuros Proyectos</h2>
        <div className="w-full h-px bg-base-300 mb-4"></div>
        <div className="flex flex-row w-full h-14 px-8 mb-4">
          <input
            type="text"
            placeholder="Buscar..."
            className="input input-bordered h-full w-10/12 py-4.5 border-primary text-primary placeholder:text-primary text-base outline-none focus:outline-none"
            style={{
              backgroundColor: "oklch(from var(--color-accent) l c h / 30%)",
            }}
          />
          <div className="relative inline-block w-2/12" ref={dropdownRef}>
            <button
              className="border border-primary text-start text-primary w-full ml-4 h-full pl-4 rounded-lg hover:cursor-pointer"
              style={{
                backgroundColor: "oklch(from var(--color-accent) l c h / 30%)",
              }}
              onClick={() => setShowCalendarInput(!showCalendarInput)}
            >
              Fechas
            </button>
            {showCalendarInput && (
              <div className="absolute right-0 mt-2 z-20 w-64 p-4 bg-white rounded-lg shadow border">
                <label className="block mb-2 text-sm font-medium text-gray-600">
                  Desde
                </label>
                <div className="relative">
                  <input
                    type="date"
                    className="input input-bordered w-full mb-4"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <div className="absolute right-3 top-4/12 -translate-y-1/2 pointer-events-none">
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
                  <div className="absolute right-3 top-6/12 -translate-y-1/2 pointer-events-none">
                    <FaCalendarAlt className="text-gray-400 text-xl" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {firstSixProjects.map((project, index) => (
            <div key={index} className="w-full">
              {project}
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
                  {project}
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
      </div>
    </div>
  );
};

export default CurrentProjects;
