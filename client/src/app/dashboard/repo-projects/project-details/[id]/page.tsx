"use client";

import React from "react";

const ProjectDetails = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const project = {
    name: "Proyecto 1",
    dates: "13 Marzo 2025 - 4 Mayo 2025",
    duration: "2 meses",
    lead: "Juan Camaney",
    company: "Cemex",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    vacancies: [
      { role: "Azure nivel 5", count: 3 },
      { role: "Azure nivel 10", count: 2 },
    ],
  };

  const candidates = [
    {
      name: "Carlos Martinez",
      id: "#000000",
      certifications: "Tiene todas las certificaciones",
      compatibility: 90,
    },
    {
      name: "Carlos Martinez",
      id: "#000000",
      certifications: "Tiene todas las certificaciones",
      compatibility: 90,
    },
    {
      name: "Carlos Martinez",
      id: "#000000",
      certifications: "Tiene todas las certificaciones",
      compatibility: 90,
    },
    {
      name: "Carlos Martinez",
      id: "#000000",
      certifications: "Tiene todas las certificaciones",
      compatibility: 90,
    },
    {
      name: "Carlos Martinez",
      id: "#000000",
      certifications: "Tiene todas las certificaciones",
      compatibility: 90,
    },
    {
      name: "Carlos Martinez",
      id: "#000000",
      certifications: "Tiene todas las certificaciones",
      compatibility: 90,
    },
    {
      name: "Carlos Martinez",
      id: "#000000",
      certifications: "Tiene todas las certificaciones",
      compatibility: 90,
    },
    {
      name: "Carlos Martinez",
      id: "#000000",
      certifications: "Tiene todas las certificaciones",
      compatibility: 90,
    },
    {
      name: "Carlos Martinez",
      id: "#000000",
      certifications: "Tiene todas las certificaciones",
      compatibility: 90,
    },
    {
      name: "Carlos Martinez",
      id: "#000000",
      certifications: "Tiene todas las certificaciones",
      compatibility: 90,
    },
    {
      name: "Carlos Martinez",
      id: "#000000",
      certifications: "Tiene todas las certificaciones",
      compatibility: 90,
    },
    {
      name: "Carlos Martinez",
      id: "#000000",
      certifications: "Tiene todas las certificaciones",
      compatibility: 90,
    },
    {
      name: "Carlos Martinez",
      id: "#000000",
      certifications: "Tiene todas las certificaciones",
      compatibility: 90,
    },
  ];

  return (
    <div className="min-h-screen bg-base-200 p-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project Details */}
        <div className="col-span-1 bg-base-100 rounded-lg shadow-md border border-base-300">
          <div className="card">
            <div className="card-title bg-primary text-primary-content p-4 rounded-t-lg">
              <h2 className="text-2xl font-bold">{project.name}</h2>
            </div>
            <div className="card-body p-6">
              <p className="text-sm text-secondary mb-2">
                <strong>Fechas:</strong> {project.dates}
              </p>
              <p className="text-sm text-secondary mb-2">
                <strong>Duración:</strong>{" "}
                <a href="#" className="link link-primary">
                  {project.duration}
                </a>
              </p>
              <p className="text-sm text-secondary mb-2">
                <strong>Delivery Lead:</strong> {project.lead}
              </p>
              <p className="text-sm text-secondary mb-2">
                <strong>Empresa:</strong> {project.company}
              </p>
              <p className="text-sm text-secondary mb-4">
                <strong>Descripción:</strong> {project.description}
              </p>
              <p className="text-sm text-secondary">
                <strong>Vacantes:</strong>
              </p>
              <ul className="list-disc list-inside text-sm text-secondary">
                {project.vacancies.map((vacancy, index) => (
                  <li key={index}>
                    {vacancy.count} {vacancy.role}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Candidates */}
        <div className="col-span-2 bg-base-100 p-6 rounded-lg shadow-md border border-base-300 max-h-[80vh]">
          <h2 className="text-2xl font-bold text-primary mb-4">Candidatos</h2>
          <div
            className="space-y-4 overflow-y-auto max-h-[calc(80vh-5rem)]" // Ensures height doesn't exceed screen size
          >
            {candidates.map((candidate, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-base-200 p-4 rounded-lg shadow-sm border border-base-300"
              >
                <div>
                  <h3 className="text-lg font-semibold text-primary">
                    {candidate.name}
                  </h3>
                  <p className="text-sm text-secondary">{candidate.id}</p>
                  <p className="text-sm text-success">
                    {candidate.certifications}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm text-secondary">Compatibilidad</p>
                    <p className="text-2xl font-bold text-success">
                      {candidate.compatibility}%
                    </p>
                  </div>
                  <button className="btn btn-primary">Postulación</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
