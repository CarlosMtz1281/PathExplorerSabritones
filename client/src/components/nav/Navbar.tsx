"use client";

import { FaHome, FaUser, FaCog } from "react-icons/fa";

export default function Navbar() {
  return (
    <div className="h-screen w-64 bg-base-100 shadow-lg flex flex-col p-4">
      <h2 className="text-2xl font-bold text-primary text-center mb-6">PathExplorer</h2>
      <ul className="flex flex-col gap-4">
        <li>
          <a href="/" className="btn btn-ghost flex items-center gap-2 w-full">
            <FaHome className="w-5 h-5" /> Home
          </a>
        </li>
        <li>
          <a href="/profile" className="btn btn-ghost flex items-center gap-2 w-full">
            <FaUser className="w-5 h-5" /> Profile
          </a>
        </li>
        <li>
          <a href="/settings" className="btn btn-ghost flex items-center gap-2 w-full">
            <FaCog className="w-5 h-5" /> Settings
          </a>
        </li>
      </ul>
    </div>
  );
}
