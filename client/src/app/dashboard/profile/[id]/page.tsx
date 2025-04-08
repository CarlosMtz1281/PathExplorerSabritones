"use client";
import React from "react";
import { useState, useEffect } from "react";
import Cargabilidad from "@/components/Cargabilidad";
import { User } from "@/interfaces/User";
import { useSession } from "next-auth/react";
import WidgetHabilidades from "@/components/perfil/WidgetHabilidades";

const Profile = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  console.log("Profile ID:", id);
  const { data: session, status } = useSession();

  const [userData, setUserData] = useState<User | null>(null);

  const fetchUserData = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/employee/user`,
        {
          headers: {
            "user-id": "1", // Hardcoded user ID
          },
        }
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
    <div className="flex flex-row h-screen bg-base-200 pl-15 gap-x-15 pr-15 py-20">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          {/* Profile Image */}
          <div className="avatar">
            <div className="w-40 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img
                src="/profilePic.jpg"
                alt="Profile"
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          {/* Profile Info */}
          <h2 className="text-4xl font-bold mt-4">{userData.name}</h2>
          <p className="text-primary text-xl">
            {userData.Permits.is_employee ? "Employee" : "Guest"}
          </p>

          {/* Cargabilidad Component */}
          <div className="mt-6">
            <Cargabilidad userId={userData.user_id} />
          </div>

          {/* Additional Info */}
          <div className="mt-6 bg-accent text-base-100 p-4 rounded-lg w-full border border-black">
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
                    {userData.Region.region_name}
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
      <div className="flex flex-row w-full min-h-screen items-start">
        <WidgetHabilidades />
      </div>
    </div>
  );
};

export default Profile;
