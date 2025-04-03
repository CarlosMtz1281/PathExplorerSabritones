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
    description: string;
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
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
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
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
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
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
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
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
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
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
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
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
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
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
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
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
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
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
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
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    },
  },
];

export default function RepoProjects() {
  const [projects, setProjects] = useState<Project[]>(dummyProjects);
  const [searchTerm, setSearchTerm] = useState(""); //Almacena el texto

  const filteredProjects = projects.filter((project) => { //Fitra los resultados
    const term = searchTerm.toLowerCase(); //Ignora las mayusculas
    return (
      project.name.toLowerCase().includes(term) ||
      project.details?.lead.toLowerCase().includes(term) ||
      project.details?.company.toLowerCase().includes(term)
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
          className="input input-bordered w-full mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <RepoProjectTable projects={filteredProjects} />
        
      </div>
    </div>
  );
}
