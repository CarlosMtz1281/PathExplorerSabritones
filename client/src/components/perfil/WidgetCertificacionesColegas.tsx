import React, { useState, useEffect } from "react";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { PiCertificate } from "react-icons/pi";
import axios from "axios";
import CertificateModal from "./CertificateModal";
import Image from "next/image";

interface Certificate {
  certificate_id: number;
  user_id: number;
  certificate_name: string;
  certificate_desc: string;
  certificate_date: string;
  certificate_expiration_date: string;
  certificate_link: string;
  certificate_status: string;
  certificate_hours: number;
  certificate_level: number;
  skills: string[];
  provider: string;
}

interface Props {
  userId?: number; // Nuevo: opcional para uso en perfil
}

export default function WidgetCertificaciones({ userId }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);
  };

  const fetchCertificates = async () => {
    try {
      if (userId) {
        //Forzar fetch por ID si viene desde el perfil

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE}/employee/user/${userId}`
        );

        console.log("Res:", res.data);

        const certs =
          res.data.Certificate_Users?.map((cu: any) => ({
            certificate_id: cu.certificate_id,
            user_id: cu.user_id,
            certificate_name: cu.Certificates?.certificate_name || "Sin nombre",
            certificate_desc: cu.Certificates?.certificate_desc || "",
            certificate_date: cu.certificate_date,
            certificate_expiration_date: cu.certificate_expiration_date,
            certificate_link: cu.certificate_link,
            certificate_status: cu.status,
            certificate_hours: cu.Certificates?.certificate_estimated_time || 0,
            certificate_level: cu.Certificates?.certificate_level || 0,
            skills: [],
            provider: cu.Certificates?.provider || "",
          })) || [];

        setCertificates(certs);
        return;
      }
    } catch (error) {
      console.error("Error fetching certificates:", error);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [userId]);

  const completedCertificates = certificates.filter(
    (cert) => cert.certificate_status === "completed"
  );
  const initialCompleted = completedCertificates.slice(0, 4);
  const remainingCompleted = completedCertificates.slice(4);

  const hasAccordionContent = remainingCompleted.length > 0;

  return (
    <div className="card bg-base-100 shadow-xl col-span-2">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <h2 className="card-title text-3xl">
            <PiCertificate />
            Certificaciones
          </h2>
        </div>
        <p className="text-secondary text-lg mt-2">
          Certificaciones Destacadas
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          {initialCompleted.map((certificate) => (
            <div
              key={certificate.certificate_id}
              onClick={() => {
                setSelectedCertificate(certificate);
                setModalIsOpen(true);
              }}
              className="card bg-base-100 flex justify-center items-center p-4 text-center border border-primary rounded-lg hover:bg-base-300 transition duration-200 ease-in-out transform hover:scale-105 cursor-pointer"
            >
              {certificate.provider && (
                <Image
                  width={300}
                  height={300}
                  src={"/companies/" + certificate.provider + ".svg"}
                  alt={certificate.certificate_name}
                  className="w-30 h-30 object-contain"
                />
              )}
              <p className="font-bold mt-1.5">{certificate.certificate_name}</p>
              <p className="text-xs text-primary mt-1">
                Completado:{" "}
                {new Date(certificate.certificate_date).toLocaleDateString(
                  "es-MX",
                  {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }
                )}
              </p>
            </div>
          ))}
          {initialCompleted.length === 0 && (
            <div className="flex flex-col items-center justify-center col-span-2 md:col-span-4 py-10">
              <PiCertificate className="text-5xl text-primary" />
              <p className="text-lg font-bold mt-2">No tiene certificaciones</p>
            </div>
          )}
        </div>

        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isExpanded ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            {remainingCompleted.map((certificate) => (
              <div
                key={certificate.certificate_id}
                onClick={() => {
                  setSelectedCertificate(certificate);
                  setModalIsOpen(true);
                }}
                className="card bg-base-100 flex justify-center items-center p-4 text-center border border-primary rounded-lg hover:bg-base-300 transition duration-200 ease-in-out transform hover:scale-105 cursor-pointer"
              >
                {certificate.provider && (
                  <Image
                    width={300}
                    height={300}
                    src={"/companies/" + certificate.provider + ".svg"}
                    alt={certificate.certificate_name}
                    className="w-30 h-30 object-contain"
                  />
                )}
                <p className="font-bold mt-1.5">
                  {certificate.certificate_name}
                </p>
                <p className="text-xs text-primary mt-1">
                  Completado:{" "}
                  {new Date(certificate.certificate_date).toLocaleDateString(
                    "es-MX",
                    {
                      year: "numeric",
                      month: "short",
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

        {hasAccordionContent && (
          <div className="flex justify-center items-center mt-6">
            <button
              className="btn btn-circle btn-accent"
              onClick={toggleAccordion}
            >
              {isExpanded ? (
                <FaArrowUp className="text-base-100" />
              ) : (
                <FaArrowDown className="text-base-100" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
