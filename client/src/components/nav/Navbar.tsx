"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  FaUser,
  FaSignOutAlt,
  FaSuitcase,
  FaUserTie,
  FaFolderOpen,
  FaUserPlus,
  FaTruckMoving,
  FaAddressBook,
  FaLightbulb,
  FaClipboardCheck,
  FaBell,
} from "react-icons/fa";
import { ImTree } from "react-icons/im";
import { IoAnalytics } from "react-icons/io5";
import { usePathname } from "next/navigation";
import axios from "axios";
import NotificationItem from "./NotificationItem";

type Notification = {
  id: number;
  certificate_id: number;
  certificate_name: string;
  days_left: number;
  expiration_date: string;
};

export default function Navbar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: session } = useSession();
  const roleId = session?.user?.role_id || 0;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  const fetchNotifications = async () => {
    try {
      const sessionId = session?.sessionId;
      if (!sessionId) {
        console.error("Session ID is missing");
        return;
      }

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE}/employee/notificationsCertificates`,
        { headers: { "session-key": sessionId } }
      );

      if (res.status === 200) {
        setNotifications(res.data);
      } else {
        console.error("Failed to fetch notifications:", res.statusText);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleLogout = async () => {
    await signOut({
      redirect: true,
      callbackUrl: "/login",
    });
  };

  const rolePermissions = {
    showProjects: [1, 2, 3, 4, 5],
    showDLDashboard: [3, 4],
    showCreateProjects: [3, 4],
    showCreateUsers: [3, 5],
    showRepoEmpleados: [1, 2, 3, 4, 5],
    showPLDashboard: [2, 3],
    showCLDashboard: [3],
  };

  const handleMouseEnter = () => setIsCollapsed(false);
  const handleMouseLeave = () => {
    setIsCollapsed(false);
    setShowNotifications(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, [session]);

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`h-screen ${
        isCollapsed ? "w-20" : "w-80"
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

      <div
        className={`transition-all duration-700 ease-in-out overflow-hidden ${
          showNotifications ? "max-h-0 opacity-0" : "max-h-full opacity-100"
        }`}
      >
        <ul className="flex flex-col gap-4 flex-grow items-start mt-10">
          {/* Perfil visible para todos */}
          <li className="w-full">
            <a
              href={`/dashboard/profile`}
              className={`btn btn-ghost flex items-center gap-4 w-full justify-start
    text-whitehover:text-primary hover:bg-base-200
    ${isActive("/dashboard/profile") ? "bg-base-200 text-primary" : ""}
  `}
            >
              <FaUser className="w-6 h-6" />
              {!isCollapsed && (
                <h3 className="text-lg font-normal whitespace-nowrap ">
                  Perfil
                </h3>
              )}
            </a>
          </li>

          {rolePermissions.showProjects.includes(roleId) && (
            <li className="w-full">
              <a
                href="/dashboard/repo-projects"
                className={`btn btn-ghost flex items-center gap-4 w-full text-white hover:text-primary hover:bg-base-200 justify-start
  ${isActive("/dashboard/repo-projects") ? "bg-base-200 text-primary" : ""}
`}
              >
                <FaFolderOpen className="w-5 h-5" />
                {!isCollapsed && (
                  <h3 className="text-lg font-norma">Proyectos</h3>
                )}
              </a>
            </li>
          )}

          {rolePermissions.showDLDashboard.includes(roleId) && (
            <li className="w-full">
              <a
                href="/dashboard/dl-dashboard"
                className={`btn btn-ghost flex items-center gap-4 w-full text-white hover:text-primary hover:bg-base-200 justify-start
  ${isActive("/dashboard/dl-dashboard") ? "bg-base-200 text-primary" : ""}
`}
              >
                <FaClipboardCheck className="w-5 h-5" />
                {!isCollapsed && (
                  <h3 className="text-lg font-normal whitespace-nowrap">
                    Delivery dashboard
                  </h3>
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
                  <h3 className="text-lg font-normal whitespace-nowrap">
                    Crear Proyectos
                  </h3>
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
                  <h3 className="text-lg font-normal whitespace-nowrap">
                    Crear Usuarios
                  </h3>
                )}
              </a>
            </li>
          )}

          {rolePermissions.showRepoEmpleados.includes(roleId) && (
            <li className="w-full">
              <a
                href="/dashboard/repo-empleados"
                className={`btn btn-ghost flex items-center gap-4 w-full text-white hover:text-primary hover:bg-base-200 justify-start
  ${isActive("/dashboard/repo-empleados") ? "bg-base-200 text-primary" : ""}
`}
              >
                <FaAddressBook className="w-5 h-5" />
                {!isCollapsed && (
                  <h3 className="text-lg font-normal whitespace-nowrap">
                    Empleados
                  </h3>
                )}
              </a>
            </li>
          )}

          {rolePermissions.showPLDashboard.includes(roleId) && (
            <li className="w-full">
              <a
                href="/dashboard/pl-dashboard"
                className={`btn btn-ghost flex items-center gap-4 w-full text-white hover:text-primary hover:bg-base-200 justify-start
  ${isActive("/dashboard/pl-dashboard") ? "bg-base-200 text-primary" : ""}
`}
              >
                <IoAnalytics className="w-5 h-5" />
                {!isCollapsed && (
                  <h3 className="text-lg font-normal whitespace-nowrap">
                    Dashboard de PL
                  </h3>
                )}
              </a>
            </li>
          )}

          {rolePermissions.showCLDashboard.includes(roleId) && (
            <li className="w-full">
              <a
                href="/dashboard/cl-dashboard"
                className={`btn btn-ghost flex items-center gap-4 w-full text-white hover:text-primary hover:bg-base-200 justify-start
  ${isActive("/dashboard/cl-dashboard") ? "bg-base-200 text-primary" : ""}
`}
              >
                <ImTree className="w-5 h-5" />
                {!isCollapsed && (
                  <h3 className="text-lg font-normal whitespace-nowrap">
                    Dashboard de CL
                  </h3>
                )}
              </a>
            </li>
          )}
        </ul>
      </div>
      <div className="divider divider-primary"></div>
      <div className="w-full">
        <button
          onClick={() => setShowNotifications((prev) => !prev)}
          className={`btn btn-ghost flex items-center gap-4 w-full hover:text-primary hover:bg-base-200 justify-start group ${
            showNotifications ? "bg-base-200 text-primary" : "text-white"
          }`}
        >
          <span className="relative w-5 h-5">
            <FaBell className="w-5 h-5" />
            {isCollapsed && notifications.length > 0 && (
              <span className="absolute top-0 right-0 block w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-secondary"></span>
            )}
          </span>
          {!isCollapsed && (
            <div className="flex items-center w-full justify-between">
              <h3 className="text-lg font-normal whitespace-nowrap">
                Notificaciones
              </h3>
              {notifications.length > 0 && (
                <div
                  className={`badge badge-md badge-white text-primary group-hover:text-white group-hover:badge-primary ${
                    showNotifications ? "badge-primary text-white" : ""
                  }`}
                >
                  {notifications.length}
                </div>
              )}
            </div>
          )}
        </button>
        <div
          className={`transition-all ease-in-out overflow-hidden mt-5 rounded-2xl ${
            showNotifications
              ? "duration-1000 max-h-full bg-white opacity-100"
              : "duration-300 max-h-0 opacity-0"
          }`}
        >
          <ul className="list text-sm p-2 text-black">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.certificate_id}
                  notification={notification}
                />
              ))
            ) : (
              <li className="h-96 flex justify-center items-center py-2 px-3 text-gray-500">
                No hay notificaciones
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="flex flex-col flex-1 justify-end ">
        {/* Toggle  */}
        <input
          type="checkbox"
          value="sabritonesDark"
          className="toggle theme-controller"
        />

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="btn btn-ghost flex items-center gap-4 w-full text-white hover:text-red-500 hover:bg-base-200 justify-start mb-4"
        >
          <FaSignOutAlt className="w-5 h-5" />
          {!isCollapsed && (
            <h3 className="text-lg font-normal whitespace-nowrap">
              Cerrar Sesión
            </h3>
          )}
        </button>
      </div>
    </div>
  );
}
