import React, { useState, useEffect } from "react";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { PiCertificate } from "react-icons/pi";
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

interface Props {
  userId?: number; // Nuevo: opcional para uso en perfil
}

export default function WidgetCertificaciones({ userId }: Props) {
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
      if (userId) {
        // ✅ Forzar fetch por ID si viene desde el perfil
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/employee/user`, {
          headers: { "user-id": userId.toString() },
        });
  
        const certs = res.data.Certificate_Users?.map((cu: any) => ({
          certificate_id: cu.certificate_id,
          user_id: cu.user_id,
          certificate_name: cu.Certificates?.certificate_name || "Sin nombre",
          certificate_desc: cu.Certificates?.certificate_desc || "",
          certificate_date: cu.certificate_date,
          certificate_expiration_date: cu.certificate_expiration_date,
          certificate_link: cu.certificate_link,
          skills: [],
          provider: cu.Certificates?.provider || "",
        })) || [];
  
        setCertificates(certs);
        return; // 👈 IMPORTANTE: no continuar a lógica de sesión
      }
  
      // 🔁 Solo si no hay userId, usar la sesión
      const sessionId = session?.sessionId;
      if (!sessionId) {
        console.error("Session ID is missing");
        return;
      }
  
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE}/course/certificates`,
        { headers: { "session-key": sessionId } }
      );
  
      setCertificates(res.data);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    }
  };
  

  useEffect(() => {
    fetchCertificates();
  }, [userId]);

  return (
    <div className="card bg-base-100 shadow-xl col-span-2">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <h2 className="card-title text-3xl">
            <PiCertificate />
            Certificaciones
          </h2>
          <button
            className="btn btn-circle btn-accent btn-xs md:btn-sm ml-auto text-base-100"
            onClick={() => setAddModalIsOpen(true)}
          >
            <IoMdAdd className="text-lg md:text-xl" />
          </button>

        </div>

        <p className="text-secondary text-lg mt-2">Certificaciones Destacadas</p>
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
                {new Date(certificate.certificate_date).toLocaleDateString("es-MX", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          ))}
        </div>

        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isExpanded ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <p className="text-secondary text-lg mt-2">Certificaciones en Curso</p>
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

        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isExpanded ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <p className="text-secondary text-lg mt-2">Certificaciones Recomendadas</p>
          <div className="flex justify-center items-center h-32 bg-base-200 border border-primary rounded-lg mt-4">
            <h2 className="text-xl color-base-200">Próximamente...</h2>
          </div>
        </div>

        {modalIsOpen && selectedCertificate && (
          <CertificateModal
            certificate={selectedCertificate}
            onClose={() => setModalIsOpen(false)}
          />
        )}

        {addModalIsOpen && !userId && (
          <AddCertificateModal
            onClose={() => {
              setAddModalIsOpen(false);
              fetchCertificates(); // Refresca
            }}
          />
        )}

        <div className="flex justify-center items-center mt-6">
          <button className="btn btn-circle btn-accent" onClick={toggleAccordion}>
            {isExpanded ? <FaArrowUp /> : <FaArrowDown />}
          </button>
        </div>
      </div>
    </div>
  );
}
