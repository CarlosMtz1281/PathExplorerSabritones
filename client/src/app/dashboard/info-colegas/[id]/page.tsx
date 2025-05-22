"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Cargabilidad from "@/components/Cargabilidad";
import WidgetCertificacionesColegas from "@/components/perfil/WidgetCertificacionesColegas";
import WidgetTrayectoriaColegas from "@/components/perfil/WidgetTrayectoriaColegas";
import WidgetTrayectoriaColegasEmpleado from "@/components/perfil/WidgetTrayectoriaColegaEmpleado";
import WidgetHabilidadesColegas from "@/components/perfil/WidgetHabilidadesColegas";
import WidgetFeedbackColegas from "@/components/perfil/WidgetFeedbackColegas";
import Image from "next/image";
import { User } from "@/interfaces/User";

const InfoColegas = () => {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data: session } = useSession();
  const viewerRoleId = session?.user?.role_id || 0;
  const [subordinado, setSubordinado] = useState(false);

  const [userData, setUserData] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/employee/user/${id}`);
        const data = await res.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    fetchUserData();
  }, [params.id]);

  useEffect(() => {
    const checkSubordinado = async () => {
      if (!session?.user?.id || !userData?.user_id) return;
  
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/employee/is-subordinate?viewer=${session.user.id}&target=${userData.user_id}`
        );
        const data = await res.json();
        setSubordinado(data.subordinado);
      } catch (error) {
        console.error("Error checking subordinado:", error);
      }
    };
  
    checkSubordinado();
  }, [session?.user?.id, userData?.user_id]);
  

  if (!userData) return <div>Loading...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh)] bg-base-200 px-4 md:px-8 py-8 gap-8">
      <div className="card w-full bg-base-100 shadow-lg p-6 rounded-lg relative">
        {/* Background Banner */}
        <div className="absolute top-0 left-0 w-full h-35 rounded-t-lg">
          <Image
            src="/banner.jpg"
            alt="Banner"
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
          />
        </div>

        {/* Profile Section */}
        <div className="flex flex-col md:flex-row justify-between gap-8 mt-20 w-full">
          <div className="flex flex-col items-center">
            <div className="avatar -mt-15 ml-5">
              <div className="w-50 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <Image
                  width={200}
                  height={200}
                  src="/profilePhoto.jpg"
                  alt="Profile"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>

          <div className="flex w-full">
            <div className="flex justify-between items-center mt-10 w-full">
              <div>
                <h2 className="text-3xl font-bold">{userData.name}</h2>
                <p className="text-gray-500 mt-2">{userData.Country.country_name}</p>
                <p className="text-gray-500">{userData.mail}</p>
                <p className="text-gray-500">
                  Zona Horaria: {userData.Country.timezone}
                </p>
              </div>

              <div className="mr-5 mt-5" style={{ width: "20vw" }}>
                <div className="flex items-center">
                  <p className="text-primary text-xl font-bold">Senior Azure</p>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-primary ml-4">
                    <div className="text-2xl font-bold">6</div>
                  </div>
                </div>
                <div className="flex items-center mt-2 w-full">
                  <Cargabilidad userId={userData.user_id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Down Column - Widgets */}
      <div className="flex">
        <div className="card w-[20vw] bg-base-100 shadow-lg p-6 rounded-lg h-auto"></div>
        <div
          className="flex flex-col gap-10 pr-5 overflow-y-auto"
          style={{ width: "68vw", marginLeft: "2vw" }}
        >
          {(
            viewerRoleId === 1 ||
            viewerRoleId === 4 ||
            (viewerRoleId === 2 && !subordinado) ||
            (viewerRoleId === 3 && !subordinado)
          ) && (
            <>              
              <WidgetCertificacionesColegas userId={userData.user_id} />
              <WidgetTrayectoriaColegasEmpleado userId={userData.user_id} />
              <WidgetHabilidadesColegas userId={userData.user_id} />
            </>
          )}


          {/* People Lead: solo puede ver Habilidades y Feedback si el perfil es subordinado directo */}
            {viewerRoleId === 2 && subordinado && (
              <>
                <WidgetCertificacionesColegas userId={userData.user_id} />
                <WidgetTrayectoriaColegasEmpleado userId={userData.user_id} />
                <WidgetHabilidadesColegas userId={userData.user_id} />
                <WidgetFeedbackColegas userId={userData.user_id} />
              </>
            )}

            {/* Capability Lead: puede ver Habilidades y Feedback si el perfil es subordinado directo o indirecto */}
            {viewerRoleId === 3 && subordinado && (
              <>
                <WidgetCertificacionesColegas userId={userData.user_id} />
                <WidgetTrayectoriaColegasEmpleado userId={userData.user_id} />
                <WidgetHabilidadesColegas userId={userData.user_id} />
                <WidgetFeedbackColegas userId={userData.user_id} />
              </>
            )}

          
            {/*Admin NADA NO TENDRA ACCESO A ESTA PAGINA*/}
          
        </div>
      </div>
    </div>
  );
};

export default InfoColegas;
