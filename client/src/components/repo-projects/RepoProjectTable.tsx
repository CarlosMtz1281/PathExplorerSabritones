import { useState } from "react";
import "@/styles/repo-projects/RepoProjectTable.css";

type Project = {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  vacants: number;
  details?: {
    capability: string;
    company?: string;
    country: string;
  };
};

type RepoProjectsTableProps = {
  projects: Project[];
  setProjects?: React.Dispatch<React.SetStateAction<Project[]>>;
};

export const RepoProjectTable = ({
  projects,
  setProjects,
}: RepoProjectsTableProps) => {
  const [hoveredRow, setHoveredRow] = useState(0);

  const handleRowClick = (id: number) => {
    setHoveredRow((prev) => (prev === id ? 0 : id));
  };

  const handleDropdownClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    handleRowClick(id);
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
              onClick={() => handleRowClick(project.id)}
            >
              <td colSpan={3}>
                <div className="row-content">
                  <div className="content-main">
                    <button
                      className="dropdown-button ml-3 hover:cursor-pointer"
                      onClick={(e) => handleDropdownClick(e, project.id)}
                      aria-label="Toggle details"
                    >
                      <svg
                        width="12"
                        height="8"
                        viewBox="0 0 12 8"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={`transition-transform ${
                          hoveredRow === project.id ? "rotate-180" : ""
                        }`}
                      >
                        <path
                          d="M1 1L6 6L11 1"
                          stroke="var(--color-base-content)"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                    <div className="name-column">{project.name}</div>
                    <div className="date-column">
                      {project.start_date} - {project.end_date}
                    </div>
                    <div className="vacancies-column">{project.vacants}</div>
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
                            <p>{project.details.capability}</p>
                          </div>
                          <div>
                            <strong>Empresa</strong>
                            <p>{project.details.company}</p>
                          </div>
                          <div>
                            <strong>Region</strong>
                            <p>{project.details.country}</p>
                          </div>
                        </div>
                        <div className="details-button-container">
                          <a href={`/dashboard/project-details/${project.id}`}>
                            <button>Asignar</button>
                          </a>
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
