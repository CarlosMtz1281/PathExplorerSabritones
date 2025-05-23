"use client";

import { use, useState } from "react";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { FaCalendarAlt, FaInfoCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function CreateProyects() {
  const { data: session } = useSession(); //Obtener la sesión actual
  const router = useRouter(); // Hook para redireccionar

  useEffect(() => {
    if (session?.user?.role_id !== 4) {
      alert("❌ No tienes permisos para acceder a esta página.");
      router.push("/dashboard"); // Redirigir a la página de inicio
    }
  }, [session, router]);
  
  type Puesto = {
    nombre: string;
    capability: string;
    desc: string;
    cantidad: number;
    habilidades: number[];
    certificaciones: number[];
  };

  const [puestos, setPuestos] = useState<Puesto[]>([]);
  const [expandSkills, setExpandSkills] = useState(false);
  const [expandCerts, setExpandCerts] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoCapability, setNuevoCapability] = useState("");
  const [nuevoDesc, setNuevoDesc] = useState("");
  const [nuevaCantidad, setNuevaCantidad] = useState(1);
  const [nuevasHabilidades, setNuevasHabilidades] = useState<number[]>([]);
  const [nuevasCertificaciones, setNuevasCertificaciones] = useState<number[]>(
    []
  );
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editCapability, setEditCapability] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editCantidad, setEditCantidad] = useState(1);
  const [editHabilidades, setEditHabilidades] = useState<number[]>([]);
  const [editCertificaciones, setEditCertificaciones] = useState<number[]>([]);
  const [projectName, setProjectName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [countryId, setCountryId] = useState("");
  const [paises, setPaises] = useState<
    { country_id: number; country_name: string }[]
  >([]);
  const [skills, setSkills] = useState<
    { skill_id: number; skill_name: string }[]
  >([]);
  const [habilidadesList, setHabilidadesList] = useState<
    { skill_id: number; skill_name: string; skill_technical: boolean }[]
  >([]);
  const [certificadosList, setCertificadosList] = useState<
    {
      certificate_id: number;
      certificate_name: string;
      certificate_desc: string;
    }[]
  >([]);
  const [capabilityList, setCapabilityList] = useState<
    { capability_id: number; capability_name: string }[]
  >([]);

  useEffect(() => {
    const fetchPaises = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/general/countries`
        );
        if (!res.ok) throw new Error(`Error al obtener países: ${res.status}`);

        const data = await res.json();
        setPaises(data);
      } catch (error) {
        console.error("❌ Error al cargar países:", error);
      }
    };

    fetchPaises();
  }, []);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/general/skills`
        );
        if (!res.ok)
          throw new Error(`Error al obtener habilidades: ${res.status}`);
        const data = await res.json();

        setHabilidadesList(data);
      } catch (error) {
        console.error("❌ Error al cargar habilidades:", error);
      }
    };
    fetchSkills();
  }, []);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/general/certificates`
        );
        if (!res.ok)
          throw new Error(`Error al obtener certificados: ${res.status}`);
        const data = await res.json();

        setCertificadosList(data);
      } catch (error) {
        console.error("❌ Error al cargar certificados:", error);
      }
    };
    fetchCertificates();
  }, []);

  useEffect(() => {
    const fetchCapabilities = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/general/capabilities`
        );
        if (!res.ok)
          throw new Error(`Error al obtener capacidades: ${res.status}`);
        const data = await res.json();

        //console.log("Capacidades:", data);

        setCapabilityList(data);
      } catch (error) {
        console.error("❌ Error al cargar capacidades:", error);
      }
    };
    fetchCapabilities();
  }, []);

  const agregarNuevoPuesto = () => {
    const nuevo = {
      nombre: nuevoNombre,
      capability: nuevoCapability,
      desc: nuevoDesc,
      cantidad: nuevaCantidad,
      habilidades: nuevasHabilidades,
      certificaciones: nuevasCertificaciones,
    };
    setPuestos([...puestos, nuevo]);
    setNuevoNombre("");
    setNuevoCapability("");
    setNuevoDesc("");
    setNuevaCantidad(1);
    setNuevasHabilidades([]);
    setNuevasCertificaciones([]);
    (
      document.getElementById("modalAgregarPuesto") as HTMLDialogElement
    )?.close();
  };

  const abrirModalAgregar = () => {
    setNuevoNombre("");
    setNuevoCapability("");
    setNuevoDesc("");
    setNuevaCantidad(1);
    setNuevasHabilidades([]);
    setNuevasCertificaciones([]);
    const modal = document.getElementById(
      "modalAgregarPuesto"
    ) as HTMLDialogElement;
    if (modal && typeof modal.showModal === "function") {
      modal.showModal();
    }
  };

  const eliminarPuesto = (index: number) => {
    const confirmacion = confirm(
      "¿Estás seguro de que deseas eliminar este puesto?"
    );
    if (!confirmacion) return;
    const actualizados = [...puestos];
    actualizados.splice(index, 1);
    setPuestos(actualizados);
  };

  const abrirModalEditar = (index: number) => {
    const p = puestos[index];
    setEditIndex(index);
    setEditNombre(p.nombre);
    setEditCapability(p.capability);
    setEditDesc(p.desc);
    setEditCantidad(p.cantidad);
    setEditHabilidades(p.habilidades);
    setEditCertificaciones(p.certificaciones);

    const modal = document.getElementById(
      "modalEditarPuesto"
    ) as HTMLDialogElement;
    if (modal && typeof modal.showModal === "function") {
      modal.showModal();
    }
  };

  const handleActualizarPuesto = () => {
    if (editIndex === null) return;

    const actualizado = {
      nombre: editNombre,
      capability: editCapability,
      desc: editDesc,
      cantidad: editCantidad,
      habilidades: editHabilidades,
      certificaciones: editCertificaciones,
    };

    const actualizados = [...puestos];
    actualizados[editIndex] = actualizado;
    setPuestos(actualizados);
    (
      document.getElementById("modalEditarPuesto") as HTMLDialogElement
    )?.close();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!session?.sessionId) {
      console.error("❌ No hay sessionId, el usuario no está autenticado.");
      alert("Necesitas iniciar sesión para continuar.");
      return;
    }
  
    const proyecto = {
      project_name: projectName,
      company_name: companyName,
      country_id: Number(countryId),
      desc: description,
      start_date: startDate,
      end_date: endDate,
      positions: puestos.map((p) => ({
        name: p.nombre,
        capability: p.capability,
        desc: p.desc,
        quantity: p.cantidad,
        skills: p.habilidades,
        certifications: p.certificaciones,
      })),
    };
  
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/project/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: session.sessionId,
          },
          body: JSON.stringify(proyecto),
        }
      );
  
      if (!res.ok) throw new Error("Error al crear proyecto");
  
      alert("✅ Proyecto creado con éxito");
  
      // ✅ Solo limpiar si todo salió bien
      setProjectName("");
      setCompanyName("");
      setCountryId("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setPuestos([]);
  
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("❌ Error al enviar datos:", err);
      alert("❌ Error al enviar datos");
    }
  };
  

  return (
    <div className="flex flex-col h-screen bg-base-200 px-15 py-10">
      {/*  Título de la pantalla */}
      <div className="flex w-full items-center bg-base-100 p-5 text-3xl font-bold rounded-md border border-base-300 mb-6">
        <p>Crear proyecto</p>
      </div>

      {/* Contenedor scrollable del formulario */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto bg-base-100 p-8 rounded-md border border-base-300 space-y-6"
      >
        {/* Título del proyecto */}
        <div>
          <label className="text-xl font-semibold">Título de proyecto</label>
          <input
            type="text"
            placeholder="Nombre del proyecto"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="input input-bordered w-full mt-2 px-6 p-5"
          />
        </div>

        {/* Empresa */}
        <div className="flex gap-6">
          <div className="flex-1">
            <label className="text-xl font-semibold">Empresa</label>
            <input
              type="text"
              placeholder="Empresa"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="input input-bordered w-full mt-2 px-6 p-5"
            />
          </div>
          {/* Región */}
          <div className="flex-1">
            <label className="text-xl font-semibold">País</label>
            <select
              value={countryId}
              onChange={(e) => setCountryId(e.target.value)}
              onBlur={(e) => setCountryId(e.target.value)}
              className="select select-bordered w-full mt-2 px-6 "
            >
              <option value="">Selecciona un país</option>
              {paises.map((pais) => (
                <option key={pais.country_id} value={String(pais.country_id)}>
                  {pais.country_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fechas */}
        <div className="flex gap-6">
          <div className="flex-1">
            <label className="text-xl font-semibold">Fecha de Inicio</label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input input-bordered w-full mt-2 pl-6 pr-10 py-5"
              />
              <div className="absolute right-3 top-7/12 -translate-y-1/2 pointer-events-none">
                <FaCalendarAlt className="text-gray-400 text-xl" />
              </div>
            </div>
          </div>
          <div className="flex-1">
            <label className="text-xl font-semibold">
              Fecha de Finalización
            </label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input input-bordered w-full mt-2 px-6 p-5"
              />
              <div className="absolute right-3 top-7/12 -translate-y-1/2 pointer-events-none">
                <FaCalendarAlt className="text-gray-400 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="text-xl font-semibold">Descripción</label>
          <textarea
            placeholder="Escribe una descripción del proyecto"
            className="textarea textarea-bordered w-full mt-2 px-6 py-4"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        {/* Tabla del stafs*/}
        <div className="overflow-x-auto mt-6">
          {/* Boton para agregar puestos */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-xl font-semibold">Staff Necesario</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={abrirModalAgregar}
            >
              Agregar Puesto
            </button>
          </div>

          {/* Modal */}
          <dialog id="modalAgregarPuesto" className="modal">
            <div className="modal-box space-y-4">
              <h3 className="font-bold text-lg">Nombre del Puesto</h3>
              <input
                type="text"
                className="input input-bordered w-full"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
              />

              <div className="flex gap-6">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">Capability</h3>
                  <select
                    className="select select-bordered w-full"
                    value={nuevoCapability}
                    onChange={(e) => setNuevoCapability(e.target.value)}
                  >
                    <option value="">Selecciona una capability</option>
                    {capabilityList.map((c) => (
                      <option key={c.capability_id} value={c.capability_name}>
                        {c.capability_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-lg">Cantidad</h3>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    value={nuevaCantidad || ""}
                    onChange={(e) =>
                      setNuevaCantidad(
                        e.target.value ? parseInt(e.target.value) : 0
                      )
                    }
                    min={1}
                  />
                </div>
              </div>
              
              <h3 className="font-bold text-lg">Habilidades</h3>
              <select
                className="select select-bordered w-full"
                onChange={(e) => {
                  const selected = e.target.value;
                  if (
                    selected &&
                    !nuevasHabilidades.includes(Number(selected))
                  ) {
                    setNuevasHabilidades([
                      ...nuevasHabilidades,
                      Number(selected),
                    ]);
                  }
                }}
              >
                <option value="">Selecciona una habilidad</option>
                {habilidadesList.map((h) => (
                  <option key={h.skill_id} value={h.skill_id}>
                    {h.skill_name}
                  </option>
                ))}
              </select>

              {/* Badges de habilidades seleccionadas */}
              <div className="flex flex-wrap gap-2 mt-2">
                {nuevasHabilidades.map((id, i) => {
                  const nombre =
                    habilidadesList.find((h) => h.skill_id === id)
                      ?.skill_name || `ID ${id}`;
                  return (
                    <div
                      key={i}
                      className="badge badge-secondary cursor-pointer"
                      onClick={() =>
                        setNuevasHabilidades(
                          nuevasHabilidades.filter((h) => h !== id)
                        )
                      }
                    >
                      {nombre} ✕
                    </div>
                  );
                })}
              </div>

              <h3 className="font-bold text-lg">Certificaciones</h3>
              <select
                className="select select-bordered w-full"
                onChange={(e) => {
                  const selected = e.target.value;
                  if (
                    selected &&
                    !nuevasCertificaciones.includes(Number(selected))
                  ) {
                    setNuevasCertificaciones([
                      ...nuevasCertificaciones,
                      Number(selected),
                    ]);
                  }
                }}
              >
                <option value="">Selecciona una certificación</option>
                {certificadosList.map((c) => (
                  <option key={c.certificate_id} value={c.certificate_id}>
                    {c.certificate_name}
                  </option>
                ))}
              </select>

              {/* Badges de certificaciones seleccionadas */}
              <div className="flex flex-wrap gap-2 mt-2">
                {nuevasCertificaciones.map((id, i) => {
                  const nombre =
                    certificadosList.find((c) => c.certificate_id === id)
                      ?.certificate_name || `ID ${id}`;
                  return (
                    <div
                      key={i}
                      className="badge badge-accent cursor-pointer"
                      onClick={() =>
                        setNuevasCertificaciones(
                          nuevasCertificaciones.filter((c) => c !== id)
                        )
                      }
                    >
                      {nombre} ✕
                    </div>
                  );
                })}
              </div>

              <h3 className="font-bold text-lg">Descripción</h3>
              <textarea
                placeholder="Escribe una descripción del puesto"
                className="textarea textarea-bordered w-full mt-2 px-6 py-4"
                rows={5}
                value={nuevoDesc}
                onChange={(e) => setNuevoDesc(e.target.value)}
              ></textarea>

              <div className="flex gap-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() =>
                    (
                      document.getElementById(
                        "modalAgregarPuesto"
                      ) as HTMLDialogElement
                    )?.close()
                  }
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={agregarNuevoPuesto}
                >
                  Agregar
                </button>
              </div>
            </div>
          </dialog>

          <dialog id="modalEditarPuesto" className="modal">
            <div className="modal-box space-y-4">
              <h3 className="font-bold text-lg">Editar Puesto</h3>

              <input
                type="text"
                className="input input-bordered w-full"
                value={editNombre}
                onChange={(e) => setEditNombre(e.target.value)}
              />

              <h3 className="font-bold text-lg">Cantidad</h3>
              <input
                type="number"
                className="input input-bordered w-full"
                value={editCantidad}
                onChange={(e) => setEditCantidad(parseInt(e.target.value))}
                min={1}
              />

              <h3 className="font-bold text-lg">Habilidades</h3>
              <select
                className="select select-bordered w-full"
                onChange={(e) => {
                  const selected = e.target.value;
                  if (selected && !editHabilidades.includes(Number(selected))) {
                    setEditHabilidades([...editHabilidades, Number(selected)]);
                  }
                }}
              >
                <option value="">Selecciona una habilidad</option>
                {habilidadesList.map((h) => (
                  <option key={h.skill_id} value={h.skill_id}>
                    {h.skill_name}
                  </option>
                ))}
              </select>

              <div className="flex flex-wrap gap-2 mt-2">
                {editHabilidades.map((id, i) => {
                  const nombre =
                    habilidadesList.find((h) => h.skill_id === id)
                      ?.skill_name || `ID ${id}`;
                  return (
                    <div
                      key={i}
                      className="badge badge-secondary cursor-pointer"
                      onClick={() =>
                        setEditHabilidades(
                          editHabilidades.filter((h) => h !== id)
                        )
                      }
                    >
                      {nombre} ✕
                    </div>
                  );
                })}
              </div>

              <h3 className="font-bold text-lg">Certificaciones</h3>
              <select
                className="select select-bordered w-full"
                onChange={(e) => {
                  const selected = e.target.value;
                  if (
                    selected &&
                    !editCertificaciones.includes(Number(selected))
                  ) {
                    setEditCertificaciones([
                      ...editCertificaciones,
                      Number(selected),
                    ]);
                  }
                }}
              >
                <option value="">Selecciona una certificación</option>
                {certificadosList.map((c) => (
                  <option key={c.certificate_id} value={c.certificate_id}>
                    {c.certificate_name}
                  </option>
                ))}
              </select>

              <div className="flex flex-wrap gap-2 mt-2">
                {editCertificaciones.map((id, i) => {
                  const nombre =
                    certificadosList.find((c) => c.certificate_id === id)
                      ?.certificate_name || `ID ${id}`;
                  return (
                    <div
                      key={i}
                      className="badge badge-accent cursor-pointer"
                      onClick={() =>
                        setEditCertificaciones(
                          editCertificaciones.filter((c) => c !== id)
                        )
                      }
                    >
                      {nombre} ✕
                    </div>
                  );
                })}
              </div>

              <div className="modal-action">
                <div className="flex gap-4">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      const modal = document.getElementById(
                        "modalEditarPuesto"
                      ) as HTMLDialogElement;
                      if (modal && typeof modal.close === "function") {
                        modal.close();
                      }
                    }}
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleActualizarPuesto}
                  >
                    Actualizar
                  </button>
                </div>
              </div>
            </div>
          </dialog>

          {/* Tabla */}
          <table className="table w-full border border-base-300">
            <thead>
              <tr className="text-base font-bold">
                <th>Puesto</th>
                <th>Capability</th>
                <th>Habilidades Técnicas</th>
                <th>Certificaciones</th>
                <th>Cantidad</th>
                <th>Editar</th>
                <th>Eliminar</th>
              </tr>
            </thead>
            <tbody>
              {/* Filas por cada puesto vacante */}
              {puestos.map((puesto, idx) => {
                const visibleSkills = expandSkills
                  ? puesto.habilidades
                  : puesto.habilidades.slice(0, 2);
                const visibleCerts = expandCerts
                  ? puesto.certificaciones
                  : puesto.certificaciones.slice(0, 2);
                const hiddenSkills = puesto.habilidades.length - 2;
                const hiddenCerts = puesto.certificaciones.length - 2;

                return (
                  <tr key={idx}>
                    <td>{puesto.nombre}</td>
                    <td>{puesto.capability}</td>

                    {/* Habilidades */}
                    <td>
                      <div className="flex flex-wrap gap-2">
                        {visibleSkills.map((id, i) => {
                          const nombre =
                            habilidadesList.find((h) => h.skill_id === id)
                              ?.skill_name || `ID ${id}`;
                          return (
                            <div key={i} className="badge badge-secondary">
                              {nombre}
                            </div>
                          );
                        })}

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
                        {visibleCerts.map((id, i) => {
                          const nombre =
                            certificadosList.find(
                              (c) => c.certificate_id === id
                            )?.certificate_name || `ID ${id}`;
                          return (
                            <div key={i} className="badge badge-accent">
                              {nombre}
                            </div>
                          );
                        })}
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
                      <button
                        type="button"
                        className="btn btn-sm btn-outline btn-circle"
                        onClick={() => abrirModalEditar(idx)}
                      >
                        ✏️
                      </button>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline btn-circle text-error"
                        onClick={() => eliminarPuesto(idx)}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* BOTON DENTRO DEL FORM */}
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            className="btn btn-primary px-10 text-lg font-semibold"
          >
            Crear proyecto
          </button>
        </div>
      </form>
    </div>
  );
}
