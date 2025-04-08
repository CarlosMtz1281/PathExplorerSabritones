import React, { useState } from "react";
import { FaArrowDown } from "react-icons/fa";
import { PiCertificate } from "react-icons/pi";
import { FaArrowUp } from "react-icons/fa";

export default function CertificationsModal() {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="card bg-base-100 shadow-xl col-span-2">
      <div className="card-body">
        <h2 className="card-title text-3xl">
          <PiCertificate />
          Certificaciones
        </h2>

        {/* Certificaciones Destacadas */}
        <p className="text-secondary text-lg mt-2">Certificaciones Destacadas</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          <div className="card bg-base-200 p-4 text-center border border-primary rounded-lg">
            <p className="font-bold">Cisco Certified Network Associate</p>
            <p className="text-sm text-secondary">Completado: 23 Jun 2023</p>
          </div>
          <div className="card bg-base-200 p-4 text-center border border-primary rounded-lg">
            <p className="font-bold">AWS Certified Solutions Architect</p>
            <p className="text-sm text-secondary">Completado: 23 Jun 2023</p>
          </div>
          <div className="card bg-base-200 p-4 text-center border border-primary rounded-lg">
            <p className="font-bold">Apex Certified Developer</p>
            <p className="text-sm text-secondary">Completado: 23 Jun 2023</p>
          </div>
          <div className="card bg-base-200 p-4 text-center border border-primary rounded-lg">
            <p className="font-bold">Azure Dev Ops Certification</p>
            <p className="text-sm text-secondary">Completado: 23 Jun 2023</p>
          </div>
        </div>

        {/* Conditionally Rendered Rows with Animation */}
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isExpanded ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {/* Certificaciones En Curso */}
          <p className="ttext-secondary text-lg mt-2">Certificaciones En Curso</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="card bg-base-200 p-4 text-center border border-primary rounded-lg">
              <p className="font-bold">Cisco Certified Network Associate</p>
              <p className="text-sm text-secondary">Completado: 23 Jun 2023</p>
            </div>
          </div>

          {/* Certificaciones Recomendadas */}
          <p className="text-secondary text-lg mt-2">Certificaciones Recomendadas</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="card bg-base-200 p-4 text-center border border-primary rounded-lg">
              <p className="font-bold">Cisco Certified Network Associate</p>
              <p className="text-sm text-secondary">Completado: 23 Jun 2023</p>
            </div>
            <div className="card bg-base-200 p-4 text-center border border-primary rounded-lg">
              <p className="font-bold">AWS Certified Solutions Architect</p>
              <p className="text-sm text-secondary">Completado: 23 Jun 2023</p>
            </div>
            <div className="card bg-base-200 p-4 text-center border border-primary rounded-lg">
              <p className="font-bold">Apex Certified Developer</p>
              <p className="text-sm text-secondary">Completado: 23 Jun 2023</p>
            </div>
            <div className="card bg-base-200 p-4 text-center border border-primary rounded-lg">
              <p className="font-bold">Azure Dev Ops Certification</p>
              <p className="text-sm text-secondary">Completado: 23 Jun 2023</p>
            </div>
          </div>
        </div>

        {/* Toggle Button */}
        <div className="flex justify-center items-center mt-6">
          <button
            className="btn btn-circle btn-accent"
            onClick={toggleAccordion}
          >
            {isExpanded ? <FaArrowUp /> : <FaArrowDown />}
          </button>
        </div>
      </div>
    </div>
  );
}