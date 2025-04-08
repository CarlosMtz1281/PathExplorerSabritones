import React, { useState, useEffect } from "react";
import { FaArrowDown } from "react-icons/fa";
import { PiCertificate } from "react-icons/pi";
import { FaArrowUp } from "react-icons/fa";
import axios from "axios";
import { useSession } from "next-auth/react";

export default function WidgetCertificaciones() {
    const { data: session } = useSession();
  const [isExpanded, setIsExpanded] = useState(false);
  const [certificates, setCertificates] = useState<any[]>([]); // State to store certificates

  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);
  };

const fetchCertificates = async () => {
  try {
    const sessionId = session?.sessionId // Retrieve sessionId from localStorage
    if (!sessionId) {
      console.error("Session ID is missing");
      return;
    }

    console.log("Session ID:", sessionId);

    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/course/certificates`, {
      headers: {
        "session-key": sessionId, 
      },
    });

    if (res.status === 401) {
      console.error("Session expired or invalid. Redirecting to login...");
      localStorage.removeItem("sessionId"); 
      window.location.href = "/login"; 
      return;
    }

    setCertificates(res.data); // Save certificates in state
    console.log("Fetched Certificates:", res.data); // Log certificates to the console
  } catch (error) {
    console.error("Error fetching certificates:", error);
  }
};

  useEffect(() => {
    fetchCertificates(); // Fetch certificates when the component is rendered
  }, []);

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
          {certificates.slice(0, 4).map((certificate) => (
            <div
              key={certificate.certificate_id}
              className="card bg-base-200 p-4 text-center border border-primary rounded-lg"
            >
              <p className="font-bold">{certificate.certificate_name}</p>
              <p className="text-sm text-secondary">
                Completado:{" "}
                {new Date(certificate.certificate_date).toLocaleDateString("es-MX", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          ))}
        </div>

        {/* Conditionally Rendered Rows with Animation */}
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isExpanded ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {/* Additional Certificates */}
          <p className="text-secondary text-lg mt-2">Más Certificaciones</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {certificates.slice(4).map((certificate) => (
              <div
                key={certificate.certificate_id}
                className="card bg-base-200 p-4 text-center border border-primary rounded-lg"
              >
                <p className="font-bold">{certificate.certificate_name}</p>
                <p className="text-sm text-secondary">
                  Completado:{" "}
                  {new Date(certificate.certificate_date).toLocaleDateString("es-MX", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            ))}
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