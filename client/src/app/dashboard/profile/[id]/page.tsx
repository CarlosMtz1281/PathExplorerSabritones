"use client";
import React from "react";
import { useState, useEffect } from "react";
import Cargabilidad from "@/components/Cargabilidad";
import WidgetCertificaciones from "@/components/perfil/WidgetCertificaciones";
import WidgetTrayectoria from "@/components/perfil/WidgetTrayectoria";
import WidgetHabilidades from "@/components/perfil/WidgetHabilidades";
import { User } from "@/interfaces/User";
import Image from "next/image";
import { useParams } from "next/navigation";

const Profile = () => {
  const { id } = useParams();
  console.log("Profile ID:", id);

  const [userData, setUserData] = useState<User | null>(null);
  const fetchUserData = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/employee/user/${id}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch user data");
      }
      const data: User = await res.json();
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh)] bg-base-200 px-4 md:px-8 py-8 gap-8 justify-center items-center">
      {/* Left Column - Profile Card (full height) */}
      <div className="card w-full md:w-auto md:max-w-sm bg-base-100 shadow-xl h-full">
        <div className="card-body items-center text-center h-full flex flex-col">
          {/* Profile Image */}
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

            {/* Profile Info */}
            <h2 className="text-3xl font-bold mt-4">{userData.name}</h2>
            <p className="text-primary text-xl">
              {userData.Permits.is_employee ? "Employee" : "Guest"}
            </p>
          </div>

          {/* Cargabilidad Component */}
          <div className="mt-4">
            <Cargabilidad userId={userData.user_id} />
          </div>

          {/* Additional Info - Removed flex-1 and added overflow control */}
          <div className="mt-6 bg-accent text-base-100 p-4 rounded-lg w-full border border-black max-h-[40%] overflow-y-auto">
            <div className="flex flex-col gap-4">
              <div className="justify-between">
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
              </div>
              <div className="justify-between">
                <div className="text-left">
                  <p className="text-base font-semibold">
                    <strong>Oficina:</strong>
                  </p>
                  <p className="text-base text-right">
                    {userData.Country.country_name}
                  </p>
                </div>
              </div>
              <div className="justify-between">
                <div className="text-left">
                  <p className="text-base font-semibold">
                    <strong>Proyecto Actual:</strong>
                  </p>
                  <p className="text-base text-right">
                    {userData.in_project ? "Staff" : "No Project"}
                  </p>
                </div>
              </div>
              <div className="justify-between">
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
      </div>
      <div className="w-full flex flex-col gap-10 pr-5 max-h-[calc(100vh-4rem)] overflow-y-auto">
        <WidgetCertificaciones />
        <WidgetTrayectoria />
        <WidgetHabilidades />
      </div>
    </div>
  );
};

export default Profile;
