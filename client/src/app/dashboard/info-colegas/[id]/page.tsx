"use client";

import React, { useState, useEffect } from "react";
import Cargabilidad from "@/components/Cargabilidad";
import WidgetCertificacionesColegas from "@/components/perfil/WidgetCertificacionesColegas";
import WidgetTrayectoriaColegas from "@/components/perfil/WidgetTrayectoriaColegas";
import WidgetTrayectoriaColegasEmpleado from "@/components/perfil/WidgetTrayectoriaColegaEmpleado";
import WidgetHabilidadesColegas from "@/components/perfil/WidgetHabilidadesColegas";
import WidgetFeedbackColegas from "@/components/perfil/WidgetFeedbackColegas";

import { User } from "@/interfaces/User";
import Image from "next/image";
import { useParams } from "next/navigation";

const InfoColegas = () => {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [userData, setUserData] = useState<User | null>(null);
  const [roleId, setRoleId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/employee/user/${id}`
        );
        const data = await res.json();
        setUserData(data);
        setRoleId(data.role_id);
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    fetchUserData();
  }, [params.id]);

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh)] bg-base-200 px-4 md:px-8 py-8 gap-8 justify-center items-center">
      {/* Left Column - Profile Card */}
      <div className="card w-full md:w-auto md:max-w-sm bg-base-100 shadow-xl h-full">
        <div className="card-body items-center text-center h-full flex flex-col">
          <div className="mt-10">
            <div className="avatar">
              <div className="w-40 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <Image
                  width={160}
                  height={160}
                  src="/profilePhoto.jpg"
                  alt="Profile"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
            <h2 className="text-3xl font-bold mt-4">{userData.name}</h2>
            <p className="text-primary text-xl">
              {userData.Permits.is_employee ? "Employee" : "Guest"}
            </p>
          </div>

          <div className="mt-6 bg-accent text-base-100 p-4 rounded-lg w-full border border-black min-w-[220px]">
            <div className="flex flex-col gap-4">
              <div className="text-left">
                <p className="text-base font-semibold">
                  <strong>Fecha de Nacimiento:</strong>
                </p>
                <p className="text-base text-right">
                  {new Date(userData.birthday).toLocaleDateString("es-MX", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div className="text-left">
                <p className="text-base font-semibold">
                  <strong>Oficina:</strong>
                </p>
                <p className="text-base text-right">
                  {userData.Country.country_name}
                </p>
              </div>

              <div className="text-left">
                <p className="text-base font-semibold">
                  <strong>Proyecto Actual:</strong>
                </p>
                <p className="text-base text-right">
                  {userData.in_project ? "Staff" : "No Project"}
                </p>
              </div>

              <div className="text-left">
                <p className="text-base font-semibold">
                  <strong>Antigüedad:</strong>
                </p>
                <p className="text-base text-right">
                  {Math.floor(
                    (new Date().getTime() -
                      new Date(userData.hire_date).getTime()) /
                      (1000 * 60 * 60 * 24 * 30)
                  )}{" "}
                  meses
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Widgets */}
      <div className="w-full flex flex-col gap-10 pr-5 max-h-[calc(100vh-4rem)] overflow-y-auto">
        
        {/* Empleado */}
        {[1].includes(roleId || 0) && (
          <div className="alert alert-info text-sm">
            <WidgetCertificacionesColegas userId={userData.user_id} />
            <WidgetTrayectoriaColegas userId={userData.user_id} />
            
          </div>
        )}

        {/* 2. People lead */}
        {[2].includes(roleId || 0) && (
          <div className="alert alert-info text-sm">
            <WidgetCertificacionesColegas userId={userData.user_id} />
            <WidgetTrayectoriaColegasEmpleado userId={userData.user_id} />
            <WidgetHabilidadesColegas userId={userData.user_id} />
            <WidgetFeedbackColegas userId={userData.user_id} />
          </div>
        )}

        {/* 3. Capability */}
        {[3].includes(roleId || 0) && (
          <div className="alert alert-info text-sm">
            <WidgetCertificacionesColegas userId={userData.user_id} />
            <WidgetTrayectoriaColegas userId={userData.user_id} />
            <WidgetHabilidadesColegas userId={userData.user_id} />
            <WidgetFeedbackColegas userId={userData.user_id} />
            
          </div>
        )}

        {/* 4. Delivery */}
        {[4].includes(roleId || 0) && (
          <div className="alert alert-info text-sm">
            <WidgetCertificacionesColegas userId={userData.user_id} />
            <WidgetTrayectoriaColegas userId={userData.user_id} />
            <WidgetHabilidadesColegas userId={userData.user_id} />
            <WidgetFeedbackColegas userId={userData.user_id} />
          </div>
        )}

        {/* 5. Admin */}
        {[5].includes(roleId || 0) && (
          <div className="alert alert-info text-sm">
            Este widget solo lo ven líderes y admin (ejemplo)
          </div>
        )}

        {/* 6. Delivery y PL*/}
        {[6].includes(roleId || 0) && (
          <div className="alert alert-info text-sm">
            Este widget solo lo ven líderes y admin (ejemplo)
          </div>
        )}

        {/* 7. Capabilty y PL */}
        {[7].includes(roleId || 0) && (
          <div className="alert alert-info text-sm">
            Este widget solo lo ven líderes y admin (ejemplo)
          </div>
        )}
      </div>

    </div>
  );
};

export default InfoColegas;
