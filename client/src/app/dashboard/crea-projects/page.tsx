"use client";

import { useState } from "react";

export default function CreateProyects() {
  return (
    <div className="flex min-h-screen max-h-screen flex-col items-center bg-base-200 px-15 py-10">
      
      <div className="flex w-full items-center bg-base-100 p-5 text-3xl font-bold rounded-md border border-base-300 mb-6">
        <p>Crear proyecto</p>
      </div>

      {/* Contenedor que tiene un scroll vertical */}
      <div className="flex h-full w-full flex-col bg-base-100 p-8 rounded-md overflow-y-auto border border-base-300 space-y-6 max-h-[75vh]">
        
        {/* Nombre proyecto */}
        <div>
          <label className="text-xl font-semibold">Título de proyecto</label>
          <input
            type="text"
            placeholder="Nombre del proyecto"
            className="input input-bordered w-full mt-2 px-6 p-5 border-primary text-primary placeholder:text-primary text-base"
            style={{
              backgroundColor: "oklch(from var(--color-accent) l c h / 30%)",
            }}
          />
        </div>

        
        <div className="flex flex-row gap-6">
          {/* Empresa */}
          <div className="flex-1"> {/* Para que ocupe el espacio comppleto de la mitad del contendor */}
            <label className="text-xl font-semibold">Empresa</label>
            <input
              type="text"
              placeholder="Empresa"
              className="input input-bordered w-full mt-2 px-6 p-5 border-primary text-primary placeholder:text-primary text-base"
              style={{
                backgroundColor: "oklch(from var(--color-accent) l c h / 30%)",
              }}
            />
          </div>

          {/* Región */}
          <div className="flex-1">
            <label className="text-xl font-semibold">Región</label>
            <input
              type="text"
              placeholder="Región"
              className="input input-bordered w-full mt-2 px-6 p-5 border-primary text-primary placeholder:text-primary text-base"
              style={{
                backgroundColor: "oklch(from var(--color-accent) l c h / 30%)",
              }}
            />
          </div>
        </div>


        {/*Habilidades tecnicas */}
        <div>
          <label className="text-xl font-semibold">Habilidades tecnicas requeridas</label>
          <input
            type="text"
            placeholder="Habilidades"
            className="input input-bordered w-full mt-2 px-6 p-5 border-primary text-primary placeholder:text-primary text-base"
            style={{
              backgroundColor: "oklch(from var(--color-accent) l c h / 30%)",
            }}
          />
        </div>

        {/*Certificados */}
        <div>
          <label className="text-xl font-semibold">Certificaciones requeridas</label>
          <input
            type="text"
            placeholder="Certificaciones"
            className="input input-bordered w-full mt-2 px-6 p-5 border-primary text-primary placeholder:text-primary text-base"
            style={{
              backgroundColor: "oklch(from var(--color-accent) l c h / 30%)",
            }}
          />
        </div>

        
        <div className="flex flex-row gap-6">
          {/* Fecha inicio */}
          <div className="flex-1">
            <label className="text-xl font-semibold">Fecha de Inicio</label>
            <input
              type="date"
              className="input input-bordered w-full mt-2 px-6 p-5 border-primary text-primary text-base"
              style={{
                backgroundColor: "oklch(from var(--color-accent) l c h / 30%)",
              }}
            />
          </div>

          {/* Fecha fin */}
          <div className="flex-1">
            <label className="text-xl font-semibold">Fecha de Finalización</label>
            <input
              type="date"
              className="input input-bordered w-full mt-2 px-6 p-5 border-primary text-primary text-base"
              style={{
                backgroundColor: "oklch(from var(--color-accent) l c h / 30%)",
              }}
            />
          </div>
        </div>

        {/* Descripcion */}
        <div>
          <label className="text-xl font-semibold">Descripción</label>
          <textarea
            placeholder="Escribe una descripción del proyecto"
            className="textarea textarea-bordered w-full mt-2 px-6 py-4 border-primary text-primary placeholder:text-primary text-base"
            rows={5}
            style={{
              backgroundColor: "oklch(from var(--color-accent) l c h / 30%)",
            }}
          ></textarea>
        </div>

        {/* Botón de crear proyecto (ahoriyta no hace nada) */}
        <div className="flex justify-end">
          <button
            className="btn btn-primary px-10 text-lg font-semibold"
            onClick={() => {
              // Falta ponerle funcionalidad 
              
            }}
          >
            Crear proyecto
          </button>
        </div>
      </div>
    </div>
  );
}
