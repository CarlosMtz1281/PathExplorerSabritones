import React from "react";
import Image from "next/image";
//badges
import cybersecurity from "@/../public/badges/cybersecurity.svg";

const WidgetPathExplorer = () => {
  const paths = [
    { name: "Ciberseguridad", points: 5321 },
    { name: "Ciberseguridad", points: 5321 },
    { name: "Ciberseguridad", points: 5321 },
  ];

  return (
    <div className="card bg-base-100 shadow-lg p-6 rounded-lg w-">
      {/* Header */}
      <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
        <span className="text-primary">
            <Image
              width={24}
              height={24}
              src="/pathExplorer.svg"
              alt="Path Explorer Icon"
              className="w-10 h-10"
            />

            
        </span>
        Path Explorer
      </h2>

      {/* Path Items */}
      <div className="flex flex-col gap-10 mt-5">
        {paths.map((path, index) => (
          <div
            key={index}
            className="flex items-center gap-4 rounded-lg "
          >
            {/* Badge */}
            <div className="">
                <div className="w-16 h-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 flex items-center justify-center">
                <Image
                  width={30}
                  height={30}
                  src={cybersecurity}
                  alt="Path Badge"
                  className="object-cover w-10 h-10 rounded-full"
                />
                </div>

            </div>

            {/* Path Info */}
            <div>
              <h3 className="text-lg font-semibold">{path.name}</h3>
              <p className="text-sm text-gray-500">{path.points.toLocaleString()} pts</p>
            </div>
          </div>
        ))}
      </div>

      {/* View More Button */}
      <button className="btn btn-outline btn-primary mt-6 w-full">Ver Más</button>
    </div>
  );
};

export default WidgetPathExplorer;