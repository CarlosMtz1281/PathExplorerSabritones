import React, { useState, useEffect } from "react";
import { FaArrowDown } from "react-icons/fa";
import { PiCertificate } from "react-icons/pi";
import { FaArrowUp } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import axios from "axios";
import { useSession } from "next-auth/react";
import CertificateModal from "./CertificateModal";
import AddCertificateModal from "./AddCertificateModal";

interface Certificate {
  certificate_id: number;
  user_id: number;
  certificate_name: string;
  certificate_desc: string;
  certificate_date: string;
  certificate_expiration_date: string;
  certificate_link: string;
  skills: string[];
  provider: string;
}
export default function WidgetCertificaciones() {
  const { data: session } = useSession();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [addModalIsOpen, setAddModalIsOpen] = useState(false);

  const [certificates, setCertificates] = useState<Certificate[]>([]);

  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);
  };

  const fetchCertificates = async () => {
    try {
      const sessionId = session?.sessionId; // Retrieve sessionId from localStorage
      if (!sessionId) {
        console.error("Session ID is missing");
        return;
      }

      console.log("Session ID:", sessionId);

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE}/course/certificates`,
        {
          headers: {
            "session-key": sessionId,
          },
        }
      );

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
        <div className="flex items-center justify-between">
          <h2 className="card-title text-3xl">
            <PiCertificate />
            Certificaciones
          </h2>
          <div>
            <button
              className="btn btn-circle btn-accent btn-xs md:btn-sm ml-auto text-base-100"
              onClick={() => setAddModalIsOpen(true)}
            >
              <IoMdAdd className="text-lg md:text-xl" />
            </button>
          </div>
        </div>

        {/* Certificaciones Destacadas */}
        <p className="text-secondary text-lg mt-2">
          Certificaciones Destacadas
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          {certificates.slice(0, 4).map((certificate) => (
            <div
              key={certificate.certificate_id}
              onClick={() => {
                setSelectedCertificate(certificate);
                setModalIsOpen(true);
              }}
              className="card bg-base-200 p-4 text-center border border-primary rounded-lg hover:bg-base-300 transition duration-200 ease-in-out transform hover:scale-105 cursor-pointer"
            >
              <p className="font-bold">{certificate.certificate_name}</p>
              <p className="text-sm text-secondary">
                Completado:{" "}
                {new Date(certificate.certificate_date).toLocaleDateString(
                  "es-MX",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
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
          <p className="text-secondary text-lg mt-2">
            Certificaciones en Curso
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {certificates.slice(4).map((certificate) => (
              <div
                key={certificate.certificate_id}
                onClick={() => {
                  setSelectedCertificate(certificate);
                  setModalIsOpen(true);
                }}
                className="card bg-base-200 p-4 text-center border border-primary rounded-lg hover:bg-base-300 transition duration-200 ease-in-out transform hover:scale-105 cursor-pointer"
              >
                <p className="font-bold">{certificate.certificate_name}</p>
                <p className="text-sm text-secondary">
                  Completado:{" "}
                  {new Date(certificate.certificate_date).toLocaleDateString(
                    "es-MX",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isExpanded ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {/* Additional Certificates */}
          <p className="text-secondary text-lg mt-2">
            Certificaciones Recomendada
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {certificates.slice(4).map((certificate) => (
              <div
                key={certificate.certificate_id}
                onClick={() => {
                  setSelectedCertificate(certificate);
                  setModalIsOpen(true);
                }}
                className="card bg-base-200 p-4 text-center border border-primary rounded-lg hover:bg-base-300 transition duration-200 ease-in-out transform hover:scale-105 cursor-pointer"
              >
                <p className="font-bold">{certificate.certificate_name}</p>
                <p className="text-sm text-secondary">
                  Completado:{" "}
                  {new Date(certificate.certificate_date).toLocaleDateString(
                    "es-MX",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
        {modalIsOpen && selectedCertificate && (
          <CertificateModal
            certificate={selectedCertificate}
            onClose={() => setModalIsOpen(false)}
          />
        )}

        {addModalIsOpen && (
          <AddCertificateModal
            onClose={() => {
              setAddModalIsOpen(false);
              fetchCertificates(); // Refresh the data of certifications
            }}
          />
        )}

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
