"use client";

import Image from "next/image";

import { useState } from "react";
import { FaHome, FaUser, FaCog, FaClipboardList, FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function Navbar() {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div
      className={`h-screen ${
        isCollapsed ? "w-20" : "w-64"
      } bg-secondary shadow-lg flex flex-col p-4 transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-4 mt-5">
        {!isCollapsed && (
          <h2 className="text-3xl font-bold text-base-100 text-center">
        PathExplorer
          </h2>
        )}
        <Image src="/Accenture.png" alt="Accenture Logo" width={40} height={40} />
      </div>
      

      <ul className="flex flex-col gap-4 flex-grow items-start mt-30">
        <li className="w-full">
            <a
            href="/dashboard/profile"
            className="btn btn-ghost flex items-center gap-2 w-full text-base-100 hover:text-primary hover:bg-base-200 justify-start"
            >
            <FaUser className="w-6 h-6" />
            {!isCollapsed && (
              <h3 className="text-2xl font-semibold">Profile</h3>
            )}
            </a>
        </li>
        <li className="w-full">
          <a
        href="/dashboard/repo-projects"
        className="btn btn-ghost flex items-center gap-2 w-full text-base-100 hover:text-primary hover:bg-base-200 justify-start"
          >
        <FaClipboardList className="w-5 h-5" />
        {!isCollapsed && (
          <h3 className="text-2xl font-semibold">CL Proyectos</h3>
        )}
          </a>
        </li>
        <li className="w-full">
          <a
        href="/dashboard/settings"
        className="btn btn-ghost flex items-center gap-2 w-full text-base-100 hover:text-primary hover:bg-base-200 justify-start"
          >
        <FaCog className="w-5 h-5" />
        {!isCollapsed && (
          <h3 className="text-2xl font-semibold">DL Proyectos</h3>
        )}
          </a>
        </li>
      </ul>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="btn btn-ghost text-base-100 hover:text-primary mt-auto flex items-center justify-center"
      >
        {isCollapsed ? <FaChevronRight className="w-5 h-5" /> : <FaChevronLeft className="w-5 h-5" />}
      </button>
    </div>
  );
}