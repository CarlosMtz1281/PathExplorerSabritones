"use client";

import React, { useState, useEffect } from "react";
import Cargabilidad from "@/components/Cargabilidad";
import WidgetCertificaciones from "@/components/perfil/WidgetCertificaciones";
import WidgetTrayectoria from "@/components/perfil/WidgetTrayectoria";
import WidgetHabilidades from "@/components/perfil/WidgetHabilidades";
import { User } from "@/interfaces/User";
import Image from "next/image";
import { useParams } from "next/navigation";

const Profile = () => {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

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
      console.log("User Data:", data);
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [id]);

  if (!userData) {
    return <div>Loading...</div>;
  }

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
        <div className="flex flex-col md:flex-row justify-between gap-8 mt-20  W-full">
          {/* Profile Image */}
          <div className="flex flex-col items-center ">
            <div className="avatar -mt-15 ml-5">
              <div className="w-50 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 ">
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

          {/* Profile Info */}
          <div className="flex w-full ">
            <div className="flex justify-between items-center mt-10 w-full">
              <div>
                <h2 className="text-3xl font-bold">{userData.name}</h2>
                <p className="text-gray-500 mt-2">
                  {userData.Country.country_name}{" "}
                </p>
                <p className=" text-gray-500">{userData.mail}</p>
                <p className=" text-gray-500">
                  Zona Horaria: {userData.Country.timezone}
                </p>
              </div>

              <div className="mr-5 mt-5 " style={{ width: "20vw" }}>
                <div className="flex items-center">
                  <p className="text-primary text-xl font-bold">Senior Azure</p>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-primary ml-4">
                    <div className="text-2xl font-bold ">6</div>
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
        <div className="card w-[20vw] bg-base-100 shadow-lg p-6 rounded-lg h-"></div>
        <div
          className="flex flex-col gap-10 pr-5 max-h-[calc(100vh-4rem)] overflow-y-auto"
          style={{ width: "68vw", marginLeft: "2vw" }}
        >
          <WidgetCertificaciones />
          <WidgetTrayectoria />
          <WidgetHabilidades />
        </div>
      </div>
    </div>
  );
};

export default Profile;
