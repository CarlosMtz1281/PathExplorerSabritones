"use client";

import { useState } from "react";
import { RepoProjectTable } from "@/components/repo-projects/RepoProjectTable";

export default function RepoProjects() {
  return (
    <div>
      <p>Proyectos por Capability: Azure</p>
      {/* Search Bar */}
      <RepoProjectTable />
    </div>
  );
}
