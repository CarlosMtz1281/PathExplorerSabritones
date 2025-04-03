import React from "react";
import Cargabilidad from "@/components/Cargabilidad";

const Profile = () => {
  return (
    <div className="flex  items-center h-screen bg-base-100 ml-15">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          {/* Profile Image */}
          <div className="avatar">
            <div className="w-40 ring-offset-base-100 ring-offset-2">
              <img
                src="/profilePic.jpg"
                alt="Profile"
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          {/* Profile Info */}
          <h2 className="text-4xl font-bold mt-4">Juan Ramirez</h2>
          <p className="text-primary text-xl ">Senior Azure 12</p>

          {/* Cargabilidad Component */}
          <div className="mt-6">
            <Cargabilidad userId={1} />
          </div>

          {/* Additional Info */}
            <div className="mt-6 bg-accent text-base-100 p-4 rounded-lg w-full border border-black">
            <div className="flex flex-col gap-4">
              <div className=" justify-between w-full">
              <div className="text-left">
                <p className="text-base font-semibold">
                <strong>Fecha de Nacimiento:</strong>
                </p>
                <p className="text-base text-right w-full">29 Abril 2002</p>
              </div>
              </div>
              <div className="justify-between">
              <div className="text-left">
                <p className="text-base font-semibold">
                <strong>Oficina:</strong>
                </p>
                <p className="text-base text-right">Monterrey</p>
              </div>
              </div>
              <div className="justify-between">
              <div className="text-left">
                <p className="text-base font-semibold">
                <strong>Proyecto Actual:</strong>
                </p>
                <p className="text-base text-right">Staff</p>
              </div>
              </div>
              <div className="justify-between">
              <div className="text-left">
                <p className="text-base font-semibold">
                <strong>Antigüedad:</strong>
                </p>
                <p className="text-base text-right">18 meses</p>
              </div>
              </div>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
