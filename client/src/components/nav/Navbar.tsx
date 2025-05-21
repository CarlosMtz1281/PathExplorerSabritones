"use client";

import Image from "next/image";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  FaHome,
  FaUser,
  FaCog,
  FaClipboardList,
  FaChevronLeft,
  FaChevronRight,
  FaSignOutAlt,
  FaGgCircle,
  FaAddressCard,
  FaDochub,
  FaProcedures,
  FaRProject,
  FaSuitcase,
  FaUserTie,
} from "react-icons/fa";
import { FaUpwork } from "react-icons/fa6";

export default function Navbar() {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleLogout = async () => {
    await signOut({
      redirect: true,
      callbackUrl: "/login",
    });
  };
  const { data: session, status } = useSession();

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
        <Image
          src="/Accenture.png"
          alt="Accenture Logo"
          width={40}
          height={40}
        />
      </div>

      <ul className="flex flex-col gap-4 flex-grow items-start mt-30">
        <li className="w-full">
          <a
            href={`/dashboard/profile/${session?.user?.id}`}
            className="btn btn-ghost flex items-center gap-2 w-full text-base-100 hover:text-primary hover:bg-base-200 justify-start"
          >
            <FaUser className="w-6 h-6" />
            {!isCollapsed && <h3 className="text-xl font-semibold">Perfil</h3>}
          </a>
        </li>
        <li className="w-full">
          <a
            href="/dashboard/repo-projects"
            className="btn btn-ghost flex items-center gap-2 w-full text-base-100 hover:text-primary hover:bg-base-200 justify-start"
          >
            <FaSuitcase className="w-5 h-5" />
            {!isCollapsed && (
              <h3 className="text-xl font-semibold"> Proyectos</h3>
            )}
          </a>
        </li>
        <li className="w-full">
          <a
            href="/dashboard/delivery-projects"
            className="btn btn-ghost flex items-center gap-2 w-full text-base-100 hover:text-primary hover:bg-base-200 justify-start"
          >
            <FaSuitcase className="w-5 h-5" />
            {!isCollapsed && (
              <h3 className="text-xl font-semibold"> Delivery proyectos</h3>
            )}
          </a>
        </li>
        <li className="w-full mt-2">
          <a
            href="/dashboard/crea-projects"
            className="btn btn-ghost flex items-center gap-4 w-full text-base-100 hover:text-primary hover:bg-base-200 justify-start"
          >
            <FaSuitcase className="w-5 h-5" />
            {!isCollapsed && (
              <h3 className="text-xl font-semibold leading-tight">
                Crear Proyectos
              </h3>
            )}
          </a>
        </li>
        <li className="w-full mt-2">
          <a
            href="/dashboard/create-users"
            className="btn btn-ghost flex items-center gap-4 w-full text-base-100 hover:text-primary hover:bg-base-200 justify-start"
          >
            <FaGgCircle className="w-5 h-5" />
            {!isCollapsed && (
              <h3 className="text-xl font-semibold">Crear Usuarios</h3>
            )}
          </a>
        </li>
        <li className="w-full">
          <a
            href="/dashboard/repo-empleados"
            className="btn btn-ghost flex items-center gap-2 w-full text-base-100 hover:text-primary hover:bg-base-200 justify-start"
          >
            <FaUser className="w-5 h-5" />
            {!isCollapsed && (
              <h3 className="text-xl font-semibold">Empleados</h3>
            )}
          </a>
        </li>

        <li className="w-full">
          <a
            href="/dashboard/pl-dashboard"
            className="btn btn-ghost flex items-center gap-2 w-full text-base-100 hover:text-primary hover:bg-base-200 justify-start"
          >
            <FaUserTie className="w-5 h-5" />
            {!isCollapsed && (
              <h3 className="text-xl font-semibold">Dashboard de PL</h3>
            )}
          </a>
        </li>

        <li className="w-full">
          <a
            href="/dashboard/cl-dashboard"
            className="btn btn-ghost flex items-center gap-2 w-full text-base-300 hover:text-primary hover:bg-base-200 justify-start"
          >
            <FaUserTie className="w-5 h-5" />
            {!isCollapsed && (
              <h3 className="text-xl font-semibold">Dashboard de CL</h3>
            )}
          </a>
        </li>
      </ul>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="btn btn-ghost flex items-center gap-2 w-full text-base-100 hover:text-red-500 hover:bg-base-200 justify-start mb-4"
      >
        <FaSignOutAlt className="w-5 h-5" />
        {!isCollapsed && (
          <h3 className="text-xl font-semibold">Cerrar Sessión</h3>
        )}
      </button>

      {/* Collapse Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="btn btn-ghost text-base-100 hover:text-primary mt-auto flex items-center justify-center"
      >
        {isCollapsed ? (
          <FaChevronRight className="w-5 h-5" />
        ) : (
          <FaChevronLeft className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
