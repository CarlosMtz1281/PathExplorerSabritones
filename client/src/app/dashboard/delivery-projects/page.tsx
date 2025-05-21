"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { RepoProjectTable } from "@/components/repo-projects/RepoProjectTable";
import { useSession } from "next-auth/react";
import { useAuthContext } from "@/app/context/AuthContext";

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

function parseDate(dateString: string): Date {
  const [day, month, year] = dateString.split("/").map(Number);
  return new Date(year, month - 1, day);
}

export default function DeliveryProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState(""); //Almacena el texto
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const { authUser } = useAuthContext();
  const { data: session } = useSession();
  const userId = session?.user.id;
  console.log("userId", userId);

  const filteredProjects = projects
    .filter((project) => {
      //Fitra los resultados
      const term = searchTerm.toLowerCase(); //Ignora las mayusculas
      return (
        project.name.toLowerCase().includes(term) ||
        project.details?.capability.toLowerCase().includes(term) ||
        project.details?.company?.toLowerCase().includes(term) ||
        project.details?.country.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      const dateA = parseDate(a.start_date).getTime();
      const dateB = parseDate(b.start_date).getTime();

      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

  const fetchProjects = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE}/project/repositories/deliveryProjects/${userId}`
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
        <p>Proyectos por Delivery</p>
      </div>
      <div className="flex h-full max-h-full w-full flex-col bg-base-100 p-5 mt-5 rounded-md overflow-hidden border border-base-300">
        <div className="flex justify-between items-center mb-4 gap-4">
          <input
            type="text"
            placeholder="Buscar por nombre, compañía o líder..."
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

        <RepoProjectTable
          projects={filteredProjects}
          setProjects={setProjects}
          permission="Delivery"
        />
      </div>
    </div>
  );
}
