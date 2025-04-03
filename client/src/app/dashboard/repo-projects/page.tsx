"use client";

import { useState } from "react";
import { RepoProjectTable } from "@/components/repo-projects/RepoProjectTable";

type Project = {
  id: number;
  name: string;
  date: string;
  vacancies: number;
  details?: {
    lead: string;
    company: string;
    region: string;
  };
};

const dummyProjects = [
  {
    id: 1,
    name: "Proyecto 1",
    date: "25/03/2025 - 03/05/2025",
    vacancies: 8,
    details: {
      lead: "Carlos Martínez",
      company: "Cemex",
      region: "LATAM",
    },
  },
  {
    id: 2,
    name: "Proyecto 2",
    date: "25/03/2025 - 03/05/2025",
    vacancies: 8,
    details: {
      lead: "Carlos Martínez",
      company: "Cemex",
      region: "NA",
    },
  },
  {
    id: 3,
    name: "Proyecto 3",
    date: "25/03/2025 - 03/05/2025",
    vacancies: 8,
    details: {
      lead: "Nicolas Treviño",
      company: "Cemex",
      region: "EMEA",
    },
  },
  {
    id: 4,
    name: "Proyecto 4",
    date: "25/03/2025 - 03/05/2025",
    vacancies: 8,
    details: {
      lead: "German Salas",
      company: "Cemex",
      region: "APAC",
    },
  },
  {
    id: 5,
    name: "Proyecto 5",
    date: "25/03/2025 - 03/05/2025",
    vacancies: 8,
    details: {
      lead: "Ivan Tamez",
      company: "Cemex",
      region: "LATAM",
    },
  },
  {
    id: 6,
    name: "Proyecto 6",
    date: "25/03/2025 - 03/05/2025",
    vacancies: 8,
    details: {
      lead: "Ivan Tamez",
      company: "Cemex",
      region: "NA",
    },
  },
  {
    id: 7,
    name: "Proyecto 7",
    date: "25/03/2025 - 03/05/2025",
    vacancies: 8,
    details: {
      lead: "Geran Salas",
      company: "Accenture",
      region: "EMEA",
    },
  },
  {
    id: 8,
    name: "Proyecto 8",
    date: "25/03/2025 - 03/05/2025",
    vacancies: 8,
    details: {
      lead: "Carlos Martínez",
      company: "Cemex",
      region: "APAC",
    },
  },
  {
    id: 9,
    name: "Proyecto 9",
    date: "25/03/2025 - 03/05/2025",
    vacancies: 8,
    details: {
      lead: "Carlos Martínez",
      company: "Cemex",
      region: "LATAM",
    },
  },
  {
    id: 10,
    name: "Proyecto 10",
    date: "25/03/2025 - 03/05/2025",
    vacancies: 8,
    details: {
      lead: "Carlos Martínez",
      company: "Cemex",
      region: "NA",
    },
  },
];

export default function RepoProjects() {
  const [projects, setProjects] = useState<Project[]>(dummyProjects);
  const [searchTerm, setSearchTerm] = useState(""); //Almacena el texto

  const filteredProjects = projects.filter((project) => {
    //Fitra los resultados
    const term = searchTerm.toLowerCase(); //Ignora las mayusculas
    return (
      project.name.toLowerCase().includes(term) ||
      project.details?.lead.toLowerCase().includes(term) ||
      project.details?.company.toLowerCase().includes(term) ||
      project.details?.region.toLowerCase().includes(term)
    );
  });

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
