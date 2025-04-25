"use client";

import { useEffect, useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

export default function AltaEmpleado() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const [countries, setCountries] = useState<
    { country_id: number; country_name: string }[]
  >([]);

  const [form, setForm] = useState({
    name: "",
    mail: "",
    birthday: "",
    area: "",
    password: "",
    country_id: "",
  });

  const [rolesSelected, setRolesSelected] = useState({
    is_employee: false,
    is_people_lead: false,
    is_capability_lead: false,
    is_delivery_lead: false,
    is_admin: false,
  });

  const validCombinations = [
    { is_employee: true, is_people_lead: false, is_capability_lead: false, is_delivery_lead: false, is_admin: false },
    { is_employee: true, is_people_lead: true, is_capability_lead: false, is_delivery_lead: false, is_admin: false },
    { is_employee: true, is_people_lead: false, is_capability_lead: true, is_delivery_lead: false, is_admin: false },
    { is_employee: true, is_people_lead: false, is_capability_lead: false, is_delivery_lead: true, is_admin: false },
    { is_employee: false, is_people_lead: false, is_capability_lead: false, is_delivery_lead: false, is_admin: true },
    { is_employee: true, is_people_lead: true, is_capability_lead: false, is_delivery_lead: true, is_admin: false },
    { is_employee: true, is_people_lead: true, is_capability_lead: true, is_delivery_lead: false, is_admin: false },
  ];

  const [experienceForm, setExperienceForm] = useState({
    company: "",
    position_name: "",
    position_desc: "",
    start_date: "",
    end_date: "",
  });

  const [experienceList, setExperienceList] = useState<
    {
      company: string;
      position_name: string;
      position_desc: string;
      start_date: string;
      end_date: string;
    }[]
  >([]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch(
          process.env.NEXT_PUBLIC_API_BASE + "/general/countries"
        );
        const data = await res.json();
        setCountries(data);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    fetchCountries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValidRoleCombo = validCombinations.some((combo) =>
      Object.entries(combo).every(
        ([k, v]) => rolesSelected[k as keyof typeof combo] === v
      )
    );

    if (!isValidRoleCombo) {
      alert(
        "❌ Combinación de roles no permitida.\n\nCombinaciones válidas:\n- Empleado\n- People Lead\n- Admin\n- Capability Lead\n- Delivery Lead\n- Combinaciones específicas como People + Delivery o People + Capability"
      );
      return;
    }

    if (!passwordRegex.test(form.password)) {
      alert("La contraseña debe tener al menos 8 caracteres, incluyendo una letra mayúscula, una letra minúscula, un número y un símbolo.");
      return;
    }

    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_BASE + "/employee/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            country_id: parseInt(form.country_id),
            experience: experienceList,
            ...rolesSelected,
          }),
        }
      );

      const result = await res.json();
      if (res.ok) {
        alert("Empleado creado exitosamente");
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (err) {
      console.error("Failed to create employee:", err);
      alert("Ocurrió un error al crear el empleado");
    }
  };

  const handleExperienceSubmit = () => {
    if (editIndex !== null) {
      const updated = [...experienceList];
      updated[editIndex] = { ...experienceForm };
      setExperienceList(updated);
      setEditIndex(null);
    } else {
      setExperienceList([...experienceList, experienceForm]);
    }
    setExperienceForm({
      company: "",
      position_name: "",
      position_desc: "",
      start_date: "",
      end_date: "",
    });
    setIsModalOpen(false);
  };

  const handleEditExperience = (index: number) => {
    setExperienceForm(experienceList[index]);
    setEditIndex(index);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center relative">
      <div className="relative z-10 bg-white p-10 rounded-xl shadow-xl w-full max-w-4xl grid grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-center col-span-2">
            Dar de Empleado de Alta
          </h2>

          <input
            type="text"
            placeholder="Nombre completo"
            className="input input-bordered w-full"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Correo Electronico"
            className="input input-bordered w-full"
            value={form.mail}
            onChange={(e) => setForm({ ...form, mail: e.target.value })}
          />
          <label className="text-sm">Fecha de Nacimiento</label>
          <div className="relative">
            <input
              type="date"
              className="input input-bordered w-full"
              value={form.birthday}
              onChange={(e) => setForm({ ...form, birthday: e.target.value })}
            />
            <div className="absolute right-3 top-6/12 -translate-y-1/2 pointer-events-none">
              <FaCalendarAlt className="text-gray-400 text-xl" />
            </div>
          </div>
          <input
            type="password"
            placeholder="Contraseña"
            className="input input-bordered w-full"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {/* Dropdown for region */}
          <select
            className="select select-bordered"
            value={form.country_id}
            onChange={(e) => setForm({ ...form, country_id: e.target.value })}
          >
            <option value="">Selecciona una región</option>
            {countries.map((country) => (
              <option key={country.country_id} value={country.country_id}>
                {country.country_name}
              </option>
            ))}
          </select>

          {/* Checkbox-based role selector */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "is_employee", label: "Empleado" },
              { key: "is_people_lead", label: "People Lead" },
              { key: "is_capability_lead", label: "Capability Lead" },
              { key: "is_delivery_lead", label: "Delivery Lead" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={rolesSelected[key as keyof typeof rolesSelected]}
                  onChange={() =>
                    setRolesSelected((prev) => ({
                      ...prev,
                      [key]: !prev[key as keyof typeof rolesSelected],
                    }))
                  }
                />
                <span>{label}</span>
              </label>
            ))}

            <label className="col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={rolesSelected.is_admin}
                onChange={() =>
                  setRolesSelected((prev) => ({
                    ...prev,
                    is_admin: !prev.is_admin,
                  }))
                }
              />
              <span>Admin</span>
            </label>
          </div>

          {/* Submit button */}
          <button type="submit" className="btn btn-primary mt-4">
            Confirmar
          </button>
        </form>

        {/* Experience Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Agregar experiencia</h3>
            <button
              className="btn btn-circle btn-sm btn-primary"
              onClick={() => {
                setEditIndex(null);
                setExperienceForm({
                  company: "",
                  position_name: "",
                  position_desc: "",
                  start_date: "",
                  end_date: "",
                });
                setIsModalOpen(true);
              }}
            >
              +
            </button>
          </div>

          {experienceList.map((exp, index) => (
            <div
              key={index}
              className="border-l-2 border-primary pl-4 mb-4 flex justify-between items-start"
            >
              <div>
                <p className="font-medium">{exp.company}</p>
                <p className="text-sm text-gray-500">└ {exp.position_name}</p>
              </div>
              <button
                className="btn btn-sm btn-circle btn-outline btn-primary"
                onClick={() => handleEditExperience(index)}
              >
                ✏️
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for experience entry */}
      {isModalOpen && (
        <>
          <input type="checkbox" className="modal-toggle" checked readOnly />
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">
                {editIndex !== null
                  ? "Editar experiencia"
                  : "Agregar experiencia"}
              </h3>

              <input
                type="text"
                placeholder="Nombre de la empresa"
                className="input input-bordered w-full mb-2"
                value={experienceForm.company}
                onChange={(e) =>
                  setExperienceForm({
                    ...experienceForm,
                    company: e.target.value,
                  })
                }
              />
              <input
                type="text"
                placeholder="Nombre del puesto"
                className="input input-bordered w-full mb-2"
                value={experienceForm.position_name}
                onChange={(e) =>
                  setExperienceForm({
                    ...experienceForm,
                    position_name: e.target.value,
                  })
                }
              />
              <textarea
                placeholder="Descripción del puesto"
                className="textarea textarea-bordered w-full mb-2"
                value={experienceForm.position_desc}
                onChange={(e) =>
                  setExperienceForm({
                    ...experienceForm,
                    position_desc: e.target.value,
                  })
                }
              />
              <label className="text-sm">Fecha de inicio</label>
              <input
                type="date"
                className="input input-bordered w-full mb-2"
                value={experienceForm.start_date}
                onChange={(e) =>
                  setExperienceForm({
                    ...experienceForm,
                    start_date: e.target.value,
                  })
                }
              />
              <label className="text-sm">Fecha de finalización</label>
              <input
                type="date"
                className="input input-bordered w-full mb-2"
                value={experienceForm.end_date}
                onChange={(e) =>
                  setExperienceForm({
                    ...experienceForm,
                    end_date: e.target.value,
                  })
                }
              />

              <div className="modal-action">
                <button className="btn" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleExperienceSubmit}
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
