"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { RepoProjectTable } from "@/components/repo-projects/RepoProjectTable";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Project = {
  project_id: number;
  project_name: string;
  company_name: string;
  capability_name: string;
  project_desc: string;
  start_date: string;
  end_date: string;
  country: {
    country_id: number;
    country_name: string;
    region_name: string;
    timezone: string;
  };
  delivery_lead: {
    user_id: number;
    name: string;
    mail: string;
  };
  open_positions: {
    position_id: number;
    position_name: string;
    position_desc: string;
    required_skills: {
      skill_id: number;
      name: string;
      technical: boolean;
    }[];
    required_certificates: {
      certificate_id: number;
      certificate_name: string;
    }[];
    required_areas: {
      area_id: number;
      area_name: string;
    }[];
  }[];
};

export default function RepoProjects() {
  const { data: session } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (session?.user?.role_id !== 3) {
      alert("❌ No tienes permisos para acceder a esta página.");
      router.push("/dashboard");
    }
  }, [session, router]);

  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Transform API data to match what RepoProjectTable expects
  const transformedProjects = projects.map(project => ({
    id: project.project_id,
    name: project.project_name,
    start_date: new Date(project.start_date).toLocaleDateString(),
    end_date: new Date(project.end_date).toLocaleDateString(),
    vacants: project.open_positions.length,
    details: {
      capability: project.capability_name,
      company: project.company_name,
      country: project.country.country_name,
      deliveryLead: project.delivery_lead.name
    }
  }));

  const filteredProjects = transformedProjects
    .filter((project) => {
      const term = searchTerm.toLowerCase();
      return (
        project.name.toLowerCase().includes(term) ||
        project.details?.capability.toLowerCase().includes(term) ||
        project.details?.company?.toLowerCase().includes(term) ||
        project.details?.country.toLowerCase().includes(term) ||
        project.details?.deliveryLead.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.start_date).getTime();
      const dateB = new Date(b.start_date).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

  const fetchProjects = async () => {
    try {
      const sessionId = session?.sessionId;

      if (!sessionId) {
        console.error("Session ID is missing");
        return;
      }

      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/project/projectsByCapability`, {
        headers: { "sessionId": sessionId },
      });

      console.log("Response data:", res.data);
      setProjects(res.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    if (session?.user?.role_id === 3) {
      fetchProjects();
    }
  }, [session]);

  return (
    <div className="flex min-h-screen max-h-screen flex-col items-center bg-base-200 px-15 py-10">
      <div className="flex w-full items-center bg-base-100 p-5 text-3xl font-semibold rounded-md border border-base-300">
        <p>Proyectos por Capability</p>
      </div>
      <div className="flex h-full max-h-full w-full flex-col bg-base-100 p-5 mt-5 rounded-md overflow-hidden border border-base-300">
        <div className="flex justify-between items-center mb-4 gap-4">
          <input
            type="text"
            placeholder="Buscar por nombre, compañía, país o líder..."
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
          permission="People"
        />
      </div>
    </div>
  );
}