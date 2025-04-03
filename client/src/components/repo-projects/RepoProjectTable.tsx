import { useState } from "react";
import "@/styles/repo-projects/RepoProjectTable.css";

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

type RepoProjectsTableProps = {
  projects: Project[];
};

const MAX_DESCRIPTION_LENGTH = 80;

export const RepoProjectTable = ({ projects }: RepoProjectsTableProps) => {
  const [hoveredRow, setHoveredRow] = useState(0);

  const truncateDescription = (text: string, maxWords: number) => {
    const words = text.split(" ");
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(" ") + "...";
    }
    return text;
  };

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
              onMouseLeave={() => setHoveredRow(0)}
            >
              <td colSpan={3}>
                <div className="row-content">
                  <div className="content-main">
                    <div className="name-column">{project.name}</div>
                    <div className="date-column">{project.date}</div>
                    <div className="vacancies-column">{project.vacancies}</div>
                  </div>

                  {project.details && (
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
                          <strong>Descripción</strong>
                          <p>
                            {truncateDescription(
                              project.details.description,
                              MAX_DESCRIPTION_LENGTH
                            )}
                          </p>
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
