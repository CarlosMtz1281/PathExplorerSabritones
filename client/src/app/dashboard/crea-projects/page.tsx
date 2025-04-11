"use client";


import { useState } from "react";
import { useSession } from "next-auth/react"; // 👈 Importar sesión


export default function CreateProyects() {
  const { data: session } = useSession(); // 👈 Obtener la sesión actual


  const [puestos, setPuestos] = useState([
    {
      nombre: "Senior Frontend Engineer",
      cantidad: 3,
      habilidades: ["React", "Angular", "C++", "Agile"],
      certificaciones: ["CS50", "AWS", "Azure"],
    },
  ]);


  const [expandSkills, setExpandSkills] = useState(false);
  const [expandCerts, setExpandCerts] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaCantidad, setNuevaCantidad] = useState(1);
  const [nuevasHabilidades, setNuevasHabilidades] = useState("");
  const [nuevasCertificaciones, setNuevasCertificaciones] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editCantidad, setEditCantidad] = useState(1);
  const [editHabilidades, setEditHabilidades] = useState("");
  const [editCertificaciones, setEditCertificaciones] = useState("");
  const [projectName, setProjectName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [countryId, setCountryId] = useState("");
  

  const agregarNuevoPuesto = () => {
    const nuevo = {
      nombre: nuevoNombre,
      cantidad: nuevaCantidad,
      habilidades: nuevasHabilidades.split(",").map((h) => h.trim()),
      certificaciones: nuevasCertificaciones.split(",").map((c) => c.trim()),
    };
    setPuestos([...puestos, nuevo]);
    setNuevoNombre("");
    setNuevaCantidad(1);
    setNuevasHabilidades("");
    setNuevasCertificaciones("");
    (document.getElementById("modalAgregarPuesto") as HTMLDialogElement)?.close();
  };


  const abrirModalEditar = (index: number) => {
    const p = puestos[index];
    setEditIndex(index);
    setEditNombre(p.nombre);
    setEditCantidad(p.cantidad);
    setEditHabilidades(p.habilidades.join(", "));
    setEditCertificaciones(p.certificaciones.join(", "));
    (document.getElementById("modalEditarPuesto") as HTMLDialogElement)?.showModal();
  };


  const handleActualizarPuesto = () => {
    if (editIndex === null) return;


    const actualizado = {
      nombre: editNombre,
      cantidad: editCantidad,
      habilidades: editHabilidades.split(",").map((h) => h.trim()),
      certificaciones: editCertificaciones.split(",").map((c) => c.trim()),
    };


    const actualizados = [...puestos];
    actualizados[editIndex] = actualizado;
    setPuestos(actualizados);
    (document.getElementById("modalEditarPuesto") as HTMLDialogElement)?.close();
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
        country_id: Number(countryId), // ✅ ahora bien nombrado
        desc: description,
        start_date: startDate,
        end_date: endDate,
        positions: puestos.map((p) => ({
          name: p.nombre,
          desc: "sin desc",
          skills: [],
          certifications: [],
        })),
      };
    


    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/project/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: session.sessionId, // O "" si aún no tienes sesión
        },
        body: JSON.stringify(proyecto),
      });
     


      if (!res.ok) throw new Error("Error al crear proyecto");
      alert("✅ Proyecto creado con éxito");
    } catch (err) {
      console.error("❌ Error al enviar datos:", err);
      alert("❌ Error al enviar datos");
    }

    // Limpiar el formulario
    setProjectName("");
    setCompanyName("");
    setCountryId("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setPuestos([]);
    
    //Regresar a arriba
    window.scrollTo({ top: 0, behavior: "smooth" });

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


        {/* Empresa y Región */}
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
          <div className="flex-1">
            <label className="text-xl font-semibold">País</label>
            <select
              value={countryId}
              onChange={(e) => setCountryId(e.target.value)}
              className="select select-bordered w-full mt-2 px-6 p-5"
            >
              <option value="">Selecciona un país</option>
              <option value="1">United States</option>
              <option value="2">Canada</option>
              <option value="3">United Kingdom</option>
              <option value="4">Germany</option>
              <option value="5">France</option>
              <option value="6">India</option>
              <option value="7">Australia</option>
              <option value="8">Japan</option>
              <option value="9">Brazil</option>
              <option value="10">South Africa</option>
            </select>
          </div>


        </div>


        {/* Fechas */}
        <div className="flex gap-6">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="input input-bordered w-full mt-2 px-6 p-5"
        />
          <div className="flex-1">
            <label className="text-xl font-semibold">Fecha de Finalización</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
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
              onClick={() =>
                (document.getElementById("modalAgregarPuesto") as HTMLDialogElement)?.showModal()
              }
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


              <h3 className="font-bold text-lg">Cantidad</h3>
              <input
                type="number"
                className="input input-bordered w-full"
                value={nuevaCantidad || ""}
                onChange={(e) =>
                  setNuevaCantidad(e.target.value ? parseInt(e.target.value) : 0)
                }
                min={1}
              />


              <h3 className="font-bold text-lg">Habilidades (separadas por coma)</h3>
              <input
                type="text"
                className="input input-bordered w-full"
                value={nuevasHabilidades}
                onChange={(e) => setNuevasHabilidades(e.target.value)}
              />


              <h3 className="font-bold text-lg">Certificaciones (separadas por coma)</h3>
              <input
                type="text"
                className="input input-bordered w-full"
                value={nuevasCertificaciones}
                onChange={(e) => setNuevasCertificaciones(e.target.value)}
              />


              <div className="modal-action">
                <form method="dialog" className="flex gap-4">
                  <button className="btn btn-outline">Cancelar</button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={agregarNuevoPuesto}
                  >
                    Agregar
                  </button>
                </form>
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
              <h3 className="font-bold text-lg">Habilidades (separadas por coma)</h3>
              <input
                type="text"
                className="input input-bordered w-full"
                value={editHabilidades}
                onChange={(e) => setEditHabilidades(e.target.value)}
              />
              <h3 className="font-bold text-lg">Certificaciones (separadas por coma)</h3>
              <input
                type="text"
                className="input input-bordered w-full"
                value={editCertificaciones}
                onChange={(e) => setEditCertificaciones(e.target.value)}
              />
              <div className="modal-action">
                <form method="dialog" className="flex gap-4">
                  <button className="btn btn-outline">Cancelar</button>
                  <button type="button" className="btn btn-primary" onClick={handleActualizarPuesto}>
                    Actualizar
                  </button>
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
              {puestos.map((puesto, idx) => {
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
                    <button
                      type="button"
                      className="btn btn-sm btn-outline btn-circle"
                      onClick={() => abrirModalEditar(idx)}
                    >
                      ✏️
                    </button>
                    </td>
                  </tr>
                );
              })}
                      </tbody>
        </table>
      </div>


      {/* ✅ BOTÓN DENTRO DEL FORM */}
      <div className="flex justify-end mt-4">
        <button type="submit" className="btn btn-primary px-10 text-lg font-semibold">
          Crear proyecto
        </button>
      </div>
    </form> {/* ← aquí cierra bien el form */}


  </div>
);
}
