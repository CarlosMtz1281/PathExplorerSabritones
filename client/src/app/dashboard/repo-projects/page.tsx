"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { RepoProjectTable } from "@/components/repo-projects/RepoProjectTable";

type Project = {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  vacants: number;
  details?: {
    capability: string;
    company?: string;
    region: string;
  };
};

export default function RepoProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState(""); //Almacena el texto

  const filteredProjects = projects.filter((project) => {
    //Fitra los resultados
    const term = searchTerm.toLowerCase(); //Ignora las mayusculas
    return (
      project.name.toLowerCase().includes(term) ||
      project.details?.capability.toLowerCase().includes(term) ||
      project.details?.company?.toLowerCase().includes(term) ||
      project.details?.region.toLowerCase().includes(term)
    );
  });

  const fetchProjects = async () => {
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_BASE + "/projects/repositories"
      );
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="flex min-h-screen max-h-screen flex-col items-center bg-base-200 px-15 py-10">
      <div className="flex w-full items-center bg-base-100 p-5 text-3xl font-semibold rounded-md border border-base-300">
        <p>Proyectos por Capability: Azure</p>
      </div>
      <div className="flex h-full max-h-full w-full flex-col bg-base-100 p-5 mt-5 rounded-md overflow-hidden border border-base-300">
        <input //Barra de busqueda
          type="text"
          placeholder="Buscar por nombre, compañía o líder..."
          className="input input-bordered w-full mb-4 px-7 py-6 border-primary text-primary placeholder:text-primary text-base outline-none focus:outline-none"
          value={searchTerm}
          style={{
            backgroundColor: "oklch(from var(--color-accent) l c h / 30%)",
          }}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <RepoProjectTable
          projects={filteredProjects}
          setProjects={setProjects}
        />
      </div>
    </div>
  );
}
