"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Cargabilidad from "@/components/Cargabilidad";
import WidgetCertificaciones from "@/components/perfil/WidgetCertificaciones";
import WidgetTrayectoria from "@/components/perfil/WidgetTrayectoria";
import WidgetHabilidades from "@/components/perfil/WidgetHabilidades";
import WidgetPathExplorer from "@/components/perfil/WidgetPathExplorer";
import WidgetMetas from "@/components/perfil/WidgetMetas";
import { User } from "@/interfaces/User";
import Image from "next/image";

const Profile = () => {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<User | null>(null);

  const fetchUserData = async (userId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/employee/user/${userId}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch user data");
      }
      const data: User = await res.json();
      console.log("User Data:", data);
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    if (session?.user && "id" in session.user) {
      fetchUserData((session.user as any).id); // If you haven't extended the Session type
    }
  }, [session]);

  if (status === "loading" || !userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-base-200 px-4 md:px-8 py-8 gap-8 overflow-x-hidden ">
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
        <div className="flex flex-col md:flex-row justify-between gap-8 mt-20  W-full">
          <div className="flex flex-col items-center ">
            <div className="avatar -mt-15 ml-5">
              <div className="w-50 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 ">
                <Image
                  width={150}
                  height={150}
                  src="/profilePhoto.jpg"
                  alt="Profile"
                  className="object-cover w-100 h-100"
                />
              </div>
            </div>
          </div>

          <div className="flex w-full ">
            <div className="flex justify-between items-center mt-10 w-full">
              <div>
                <h2 className="text-3xl font-bold">{userData.name}</h2>
                <p className="text-gray-500 mt-2">
                  {userData.Country.country_name}
                </p>
                <p className=" text-gray-500">{userData.mail}</p>
                <p className=" text-gray-500">
                  Zona Horaria: {userData.Country.timezone}
                </p>
                <p className=" text-gray-500">
                  Antigüedad:{" "}
                  {(() => {
                    const hire = new Date(userData.hire_date);
                    const now = new Date();
                    let years = now.getFullYear() - hire.getFullYear();
                    let months = now.getMonth() - hire.getMonth();
                    if (months < 0) {
                      years--;
                      months += 12;
                    }
                    return `${years} año${
                      years !== 1 ? "s" : ""
                    } y ${months} mes${months !== 1 ? "es" : ""}`;
                  })()}
                </p>
              </div>

              <div className="mr-5 mt-5 " style={{ width: "25vw" }}>
                <div className="flex items-center">
                  <p className="text-primary text-xl font-bold">
                    {userData.position_name}
                  </p>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-primary ml-4">
                    <div className="text-2xl font-bold ">{userData.level}</div>
                  </div>
                </div>

                {/* Cargabilidad */}
                <div className="flex items-center mt-2 w-full">
                  <Cargabilidad userId={userData.user_id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        <div className="w-[30vw]">
          <WidgetPathExplorer />
        </div>
        <div
          className="flex flex-col gap-10 pr-5 "
          style={{ width: "65vw", marginLeft: "2vw" }}
        >
          <WidgetMetas />
          <WidgetCertificaciones />
          <WidgetTrayectoria />
          <WidgetHabilidades />
        </div>
      </div>
    </div>
  );
};

export default Profile;
