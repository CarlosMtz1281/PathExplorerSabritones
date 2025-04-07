"use client";

import { useState } from "react";

export default function CreateProyects() {
  // 🔧 Datos harcodeados de ejemplo 
  const puestosDemo = [
    {
      nombre: "Senior Frontend Engineer",
      cantidad: 3,
      habilidades: ["React", "Angular", "C++", "Agile"],
      certificaciones: ["CS50", "AWS", "Azure"],
    },
    {
      nombre: "Backend Developer",
      cantidad: 2,
      habilidades: ["Node.js", "PostgreSQL", "Prisma", "Docker", "CI/CD"],
      certificaciones: ["AWS Developer", "Kubernetes"],
    },
  ];

  //  Estados para mostrar todas las habilidades o certificaciones o nomas 2
  const [expandSkills, setExpandSkills] = useState(false);
  const [expandCerts, setExpandCerts] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-base-200 px-15 py-10">
      {/*  Título de la pantalla */}
      <div className="flex w-full items-center bg-base-100 p-5 text-3xl font-bold rounded-md border border-base-300 mb-6">
        <p>Crear proyecto</p>
      </div>

      {/* Contenedor scrollable del formulario */}
      <div className="flex-1 overflow-y-auto bg-base-100 p-8 rounded-md border border-base-300 space-y-6">
        {/* Título del proyecto */}
        <div>
          <label className="text-xl font-semibold">Título de proyecto</label>
          <input
            type="text"
            placeholder="Nombre del proyecto"
            className="input input-bordered w-full mt-2 px-6 p-5"
          />
        </div>

        {/* Empresa y Región */}
        <div className="flex gap-6">
          <div className="flex-1">
            <label className="text-xl font-semibold">Empresa</label>
            <input
              type="text"
              placeholder="Empresa"
              className="input input-bordered w-full mt-2 px-6 p-5"
            />
          </div>
          <div className="flex-1">
            <label className="text-xl font-semibold">Región</label>
            <input
              type="text"
              placeholder="Región"
              className="input input-bordered w-full mt-2 px-6 p-5"
            />
          </div>
        </div>

        {/* Fechas */}
        <div className="flex gap-6">
          <div className="flex-1">
            <label className="text-xl font-semibold">Fecha de Inicio</label>
            <input
              type="date"
              className="input input-bordered w-full mt-2 px-6 p-5"
            />
          </div>
          <div className="flex-1">
            <label className="text-xl font-semibold">Fecha de Finalización</label>
            <input
              type="date"
              className="input input-bordered w-full mt-2 px-6 p-5"
            />
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="text-xl font-semibold">Descripción</label>
          <textarea
            placeholder="Escribe una descripción del proyecto"
            className="textarea textarea-bordered w-full mt-2 px-6 py-4"
            rows={5}
          ></textarea>
        </div>

        {/* Tabla del stafs*/}
        <div className="overflow-x-auto mt-6">
          {/* Boton para agregar puestos */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-xl font-semibold">Staff Necesario</p>
            <button
              className="btn btn-primary"
              onClick={() =>
                (document.getElementById("modalAgregarPuesto") as HTMLDialogElement)?.showModal()
              }
            >
              Agregar Puesto
            </button>
          </div>

          {/* Formulario para agregar puesto (por ahora no agrega en tabla) */}
          <dialog id="modalAgregarPuesto" className="modal">
            <div className="modal-box space-y-4">
              <h3 className="font-bold text-lg">Nombre del Puesto</h3>
              <input type="text" className="input input-bordered w-full" />
              <h3 className="font-bold text-lg">Descripción</h3>
              <textarea className="textarea textarea-bordered w-full" rows={3}></textarea>
              <h3 className="font-bold text-lg">Habilidades</h3>
              <input type="text" className="input input-bordered w-full" />
              <div className="mt-2">
                <div className="badge badge-ghost badge-lg">C++</div>
                <div className="badge badge-ghost badge-lg ml-2">React</div>
              </div>
              <div className="modal-action">
                <form method="dialog" className="flex gap-4">
                  <button className="btn btn-outline">Cancelar</button>
                  <button className="btn btn-primary">Agregar</button>
                </form>
              </div>
            </div>
          </dialog>

          {/* Tabla */}
          <table className="table w-full border border-base-300">
            <thead>
              <tr className="text-base font-bold">
                <th>Puesto</th>
                <th>Habilidades Técnicas</th>
                <th>Certificaciones</th>
                <th>Cantidad</th>
                <th>Editar</th>
              </tr>
            </thead>
            <tbody>
              {/* Filas por cada puesto vacante */}
              {puestosDemo.map((puesto, idx) => {
                const visibleSkills = expandSkills ? puesto.habilidades : puesto.habilidades.slice(0, 2);
                const visibleCerts = expandCerts ? puesto.certificaciones : puesto.certificaciones.slice(0, 2);
                const hiddenSkills = puesto.habilidades.length - 2;
                const hiddenCerts = puesto.certificaciones.length - 2;

                return (
                  <tr key={idx}>
                    <td>{puesto.nombre}</td>

                    {/* Habilidades */}
                    <td>
                      <div className="flex flex-wrap gap-2">
                        {visibleSkills.map((s, i) => (
                          <div key={i} className="badge badge-secondary">{s}</div>
                        ))}
                        {!expandSkills && hiddenSkills > 0 && (
                          <div
                            className="badge badge-outline cursor-pointer"
                            onClick={() => setExpandSkills(true)}
                          >
                            +{hiddenSkills}
                          </div>
                        )}
                        {expandSkills && hiddenSkills > 0 && (
                          <div
                            className="badge badge-outline cursor-pointer"
                            onClick={() => setExpandSkills(false)}
                          >
                            Ver menos
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Certificaciones */}
                    <td>
                      <div className="flex flex-wrap gap-2">
                        {visibleCerts.map((c, i) => (
                          <div key={i} className="badge badge-accent">{c}</div>
                        ))}
                        {!expandCerts && hiddenCerts > 0 && (
                          <div
                            className="badge badge-outline cursor-pointer"
                            onClick={() => setExpandCerts(true)}
                          >
                            +{hiddenCerts}
                          </div>
                        )}
                        {expandCerts && hiddenCerts > 0 && (
                          <div
                            className="badge badge-outline cursor-pointer"
                            onClick={() => setExpandCerts(false)}
                          >
                            Ver menos
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Cantidad */}
                    <td>{puesto.cantidad}</td>

                    {/* Botón editar */}
                    <td>
                      <button className="btn btn-sm btn-outline btn-circle">✏️</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botón de Crear Proyecto Todavia no hace nada*/}
      <div className="flex justify-end mt-4">
        <button className="btn btn-primary px-10 text-lg font-semibold">
          Crear proyecto
        </button>
      </div>
    </div>
  );
}
