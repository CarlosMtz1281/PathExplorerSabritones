"use client";

import Image from "next/image";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  FaUser,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaSuitcase,
  FaGgCircle,
  FaUserTie,
  FaFolderOpen,
  FaUserPlus,
  FaTruckMoving,
  FaAddressBook,
  FaLightbulb,
} from "react-icons/fa";
import { usePathname } from "next/navigation";


export default function Navbar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { data: session } = useSession();
  const roleId = session?.user?.role_id || 0;
  const userId = session?.user?.id;

  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;


  const handleLogout = async () => {
    await signOut({
      redirect: true,
      callbackUrl: "/login",
    });
  };

  const rolePermissions = {
    showProjects: [1, 2, 3, 4, 5],
    showDLDashboard: [4],
    showCreateProjects: [4],
    showCreateUsers: [5],
    showRepoEmpleados: [1, 2, 3, 4, 5],
    showPLDashboard: [2, 3],
    showCLDashboard: [3],
  };

  const handleMouseEnter = () => setIsCollapsed(false);
  const handleMouseLeave = () => setIsCollapsed(true);




  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`h-screen ${
      isCollapsed ? "w-20" : "w-64"
      } bg-secondary shadow-lg flex flex-col p-4 transition-all duration-300 rounded-tr-lg rounded-br-lg`}
    >
      <div className="flex items-center justify-between mb-4 mt-5">
      {!isCollapsed && (
        <h2 className="text-3xl font-bold text-white text-center">
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

      <ul className="flex flex-col gap-4 flex-grow items-start mt-10">
      {/* Perfil visible para todos */}
      <li className="w-full">
        <a
            href={`/dashboard/profile`}
            className={`btn btn-ghost flex items-center gap-2 w-full justify-start
              text-whitehover:text-primary hover:bg-base-200
              ${isActive("/dashboard/profile") ? "bg-base-200 text-primary" : ""}
            `}
          >
        <FaUser className="w-6 h-6" />
        {!isCollapsed && <h3 className="text-lg font-normal whitespace-nowrap ">Perfil</h3>}
        </a>
      </li>

      {rolePermissions.showProjects.includes(roleId) && (
        <li className="w-full">
        <a
          href="/dashboard/repo-projects"
          className={`btn btn-ghost flex items-center gap-2 w-full text-white hover:text-primary hover:bg-base-200 justify-start
            ${isActive("/dashboard/repo-projects") ? "bg-base-200 text-primary" : ""}
          `}
        >
          <FaFolderOpen className="w-5 h-5" />
          {!isCollapsed && <h3 className="text-lg font-norma">Proyectos</h3>}
        </a>
        </li>
      )}

      {rolePermissions.showDLDashboard.includes(roleId) && (
        <li className="w-full">
        <a
          href="/dashboard/dl-dashboard"
          className={`btn btn-ghost flex items-center gap-2 w-full text-white hover:text-primary hover:bg-base-200 justify-start
            ${isActive("/dashboard/dl-dashboard") ? "bg-base-200 text-primary" : ""}
          `}
        >
          <FaTruckMoving className="w-5 h-5" />
          {!isCollapsed && (
          <h3 className="text-lg font-normal whitespace-nowrap">Delivery dashboard</h3>
          )}
        </a>
        </li>
      )}

      {rolePermissions.showCreateProjects.includes(roleId) && (
        <li className="w-full mt-2">
        <a
          href="/dashboard/crea-projects"
          className={`btn btn-ghost flex items-center gap-4 w-full text-white hover:text-primary hover:bg-base-200 justify-start
            ${isActive("/dashboard/crea-projects") ? "bg-base-200 text-primary" : ""}
          `}
        >
          <FaSuitcase className="w-5 h-5" />
          {!isCollapsed && (
          <h3 className="text-lg font-normal whitespace-nowrap">Crear Proyectos</h3>
          )}
        </a>
        </li>
      )}

      {rolePermissions.showCreateUsers.includes(roleId) && (
        <li className="w-full mt-2">
        <a
          href="/dashboard/create-users"
          className={`btn btn-ghost flex items-center gap-4 w-full text-white hover:text-primary hover:bg-base-200 justify-start
            ${isActive("/dashboard/create-users") ? "bg-base-200 text-primary" : ""}
          `}
        >
          <FaUserPlus className="w-5 h-5" />
          {!isCollapsed && (
          <h3 className="text-lg font-normal whitespace-nowrap">Crear Usuarios</h3>
          )}
        </a>
        </li>
      )}

      {rolePermissions.showRepoEmpleados.includes(roleId) && (
        <li className="w-full">
        <a
          href="/dashboard/repo-empleados"
          className={`btn btn-ghost flex items-center gap-2 w-full text-white hover:text-primary hover:bg-base-200 justify-start
            ${isActive("/dashboard/repo-empleados") ? "bg-base-200 text-primary" : ""}
          `}
        >
          <FaAddressBook className="w-5 h-5" />
          {!isCollapsed && (
          <h3 className="text-lg font-normal whitespace-nowrap">Empleados</h3>
          )}
        </a>
        </li>
      )}

      {rolePermissions.showPLDashboard.includes(roleId) && (
        <li className="w-full">
        <a
          href="/dashboard/pl-dashboard"
          className={`btn btn-ghost flex items-center gap-2 w-full text-white hover:text-primary hover:bg-base-200 justify-start
            ${isActive("/dashboard/pl-dashboard") ? "bg-base-200 text-primary" : ""}
          `}
        >
          <FaLightbulb className="w-5 h-5" />
          {!isCollapsed && (
          <h3 className="text-lg font-normal whitespace-nowrap">Dashboard de PL</h3>
          )}
        </a>
        </li>
      )}

      {rolePermissions.showCLDashboard.includes(roleId) && (
        <li className="w-full">
        <a
          href="/dashboard/cl-dashboard"
          className={`btn btn-ghost flex items-center gap-2 w-full text-white hover:text-primary hover:bg-base-200 justify-start
            ${isActive("/dashboard/cl-dashboard") ? "bg-base-200 text-primary" : ""}
          `}
        >
          <FaUserTie className="w-5 h-5" />
          {!isCollapsed && (
          <h3 className="text-lg font-normal whitespace-nowrap">Dashboard de CL</h3>
          )}
        </a>
        </li>
      )}
      </ul>
      

      {/* Toggle  */}
      <input type="checkbox" value="sabritonesDark" className="toggle theme-controller" />


      {/* Logout */}
      <button
      onClick={handleLogout}
      className="btn btn-ghost flex items-center gap-2 w-full text-white hover:text-red-500 hover:bg-base-200 justify-start mb-4"
      >
      <FaSignOutAlt className="w-5 h-5" />
      {!isCollapsed && (
        <h3 className="text-lg font-normal whitespace-nowrap">Cerrar Sesión</h3>
      )}
      </button>

     
    </div>
  );
}