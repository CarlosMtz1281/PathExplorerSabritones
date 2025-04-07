"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";


export default function CreateProyects() {
  const { data: session, status } = useSession();
  
  return (
    <div className="flex min-h-screen max-h-screen flex-col items-center bg-base-200 px-15 py-10">
      <div className="flex w-full items-center bg-base-100 p-5 text-3xl font-semibold rounded-md border border-base-300">
        <input
            type="text"
            placeholder="Nombre del proyecto"
            className="w-full outline-0"
        />
      </div>
      <div className="flex h-full max-h-full w-full flex-col bg-base-100 p-5 mt-5 rounded-md overflow-hidden border border-base-300 pl-12 pr-12">
            <p className="text-xl pb-3">Empresa</p>
            <input
                type="text"
                placeholder="Nombre de la Empresa"
                className="input input-bordered w-full mb-4 px-7 p-6 border-primary text-primary placeholder:text-primary text-base outline-none focus:outline-none "
                style={{
                    backgroundColor: "oklch(from var(--color-accent) l c h / 30%)",
                }}
            />
        </div>
    </div>
  );
}
