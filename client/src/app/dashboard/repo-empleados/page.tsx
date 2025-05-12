"use client";

import { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import axios from "axios";

interface Employee {
    user_id: number;
    name: string;
    mail: string;
    hire_date: string;
    country: string;
    capability_name: string;
    capability_lead: string;
    skills: string[];
    certifications: string[];
  }
  
  

export default function RepoEmpleados() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE}/employee/list`
        );
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  const calculateAntiguedad = (hireDate: string) => {
    const start = new Date(hireDate);
    const now = new Date();

    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    const yearStr = years > 0 ? `${years} ${years === 1 ? "Año" : "Años"}` : "";
    const monthStr = months > 0 ? `${months} ${months === 1 ? "mes" : "meses"}` : "";

    return [yearStr, monthStr].filter(Boolean).join(" y ") || "Menos de un mes";
  };

  const filtered = employees
    .filter((emp) => {
      const term = searchTerm.toLowerCase();
      return (
        emp.name.toLowerCase().includes(term) ||
        emp.mail.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      return sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    });

  return (
    <div className="flex min-h-screen max-h-screen flex-col items-center bg-base-200 px-15 py-10">
      <div className="flex w-full items-center bg-base-100 p-5 text-3xl font-semibold rounded-md border border-base-300">
        <p>Repositorio de Empleados</p>
      </div>

      <div className="flex h-full max-h-full w-full flex-col bg-base-100 p-5 mt-5 rounded-md overflow-hidden border border-base-300">
        <div className="flex justify-between items-center mb-4 gap-4">
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            className="input input-bordered w-full h-full py-4.5 border-primary text-primary placeholder:text-primary text-base outline-none focus:outline-none"
            value={searchTerm}
            style={{
              backgroundColor: "oklch(from var(--color-accent) l c h / 30%)",
            }}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="select select-bordered h-full w-2/12 bg-accent/30 py-4 border-primary text-primary text-base placeholder:text-primary outline-none focus:outline-none"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
          >
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
        </div>

        <div className="overflow-y-auto overflow-x-auto w-full">
          <table className="table w-full">
            <thead>
              <tr className="text-sm text-neutral font-bold">
                <th className="w-0"></th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Área</th>
                <th>Capability</th>
                <th>Antigüedad</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp, idx) => (
                <>
                  <tr key={emp.user_id} className="hover:bg-base-200 transition-colors">
                    <td className="text-center">
                      <button
                        onClick={() =>
                          setExpandedIndex(expandedIndex === idx ? null : idx)
                        }
                        className="btn btn-ghost btn-sm"
                      >
                        {expandedIndex === idx ? (
                          <FaChevronUp className="w-4 h-4" />
                        ) : (
                          <FaChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td>{emp.name}</td>
                    <td>{emp.mail}</td>
                    <td>{emp.capability_name || "N/A"}</td>
                    <td>{emp.capability_lead || "N/A"}</td>
                    <td>{calculateAntiguedad(emp.hire_date)}</td>
                  </tr>
                  {expandedIndex === idx && (
                    <tr className="hover:bg-violet-50 transition-colors">
                      <td colSpan={6} className="p-4">
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p><strong>Correo:</strong> {emp.mail}</p>
                            <p><strong>Delivery Lead:</strong> Proximanete..</p>
                            <p><strong>Región:</strong> {emp.country}</p>
                            <p><strong>Proyecto actual:</strong>Proximanete..</p>
                            <p><strong>Nivel:</strong> Proximanete..</p>
                          </div>
                          <div>
                          <p className="font-semibold">Habilidades:</p>
                            <div className="flex flex-wrap gap-2 mt-1 mb-3">
                            {emp.skills.length > 0 ? (
                                emp.skills.map((skill, i) => (
                                <span key={i} className="badge badge-ghost">{skill}</span>
                                ))
                            ) : (
                                <span className="badge badge-ghost">N/A</span>
                            )}
                            </div>

                            <p className="font-semibold">Certificaciones:</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                {emp.certifications.length > 0 ? (
                                    emp.certifications.map((cert, i) => (
                                    <span key={i} className="badge badge-ghost">{cert}</span>
                                    ))
                                ) : (
                                    <span className="badge badge-ghost">N/A</span>
                                )}
                                </div>

                          </div>
                          <div className="md:col-span-2 text-right">
                            <button className="btn btn-primary btn-sm">Ir a Perfil</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-base-content">
                    No se encontraron empleados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
