import { useState } from "react";
import "@/styles/repo-projects/RepoProjectTable.css";

export const RepoProjectTable = () => {
  const [hoveredRow, setHoveredRow] = useState(null);

  const projects = [
    {
      id: 1,
      name: "Proyecto 1",
      date: "25/03/2025 - 03/05/2025",
      vacancies: 8,
    },
    {
      id: 2,
      name: "Proyecto 1",
      date: "25/03/2025 - 03/05/2025",
      vacancies: 8,
    },
    {
      id: 3,
      name: "Proyecto 1",
      date: "25/03/2025 - 03/05/2025",
      vacancies: 8,
      details: {
        lead: "Carlos Martínez",
        company: "Cemex",
        description:
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      },
    },
    {
      id: 4,
      name: "Proyecto 1",
      date: "25/03/2025 - 03/05/2025",
      vacancies: 8,
    },
  ];

  return (
    <div className="table-container">
      <table className="project-table">
        <thead>
          <tr className="table-header">
            <th className="name-header">Nombre</th>
            <th className="date-header">Fecha</th>
            <th className="vacancies-header"># de Vacantes</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr
              key={project.id}
              className={`table-row ${
                hoveredRow === project.id ? "hovered" : ""
              }`}
              onMouseEnter={() => setHoveredRow(project.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <td colSpan={3}>
                <div className="row-content">
                  <div className="content-main">
                    <div className="name-column">{project.name}</div>
                    <div className="date-column">{project.date}</div>
                    <div className="vacancies-column">{project.vacancies}</div>
                  </div>

                  {project.details && hoveredRow === project.id && (
                    <div
                      className={`details-container ${
                        hoveredRow === project.id ? "expanded" : ""
                      }`}
                    >
                      <div className="details-content">
                        <div className="details-delivery-empresa">
                          <div>
                            <strong>Delivery Lead</strong>
                            <p>{project.details.lead}</p>
                          </div>
                          <div>
                            <strong>Empresa</strong>
                            <p>{project.details.company}</p>
                          </div>
                        </div>
                        <div className="details-description">
                          <strong>Descripción</strong>{" "}
                          <p>{project.details.description}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
