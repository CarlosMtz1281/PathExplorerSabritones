import React, { useState, useEffect } from "react";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { PiCertificate } from "react-icons/pi";
import { IoMdAdd } from "react-icons/io";
import axios from "axios";
import { useSession } from "next-auth/react";
import CertificateModal from "./CertificateModal";
import AddCertificateModal from "./AddCertificateModal";
import Image from "next/image";

interface Certificate {
  certificate_id: number;
  user_id: number;
  certificate_name: string;
  certificate_desc: string;
  certificate_date: string;
  certificate_start_date: string;
  certificate_expiration_date: string;
  certificate_link: string;
  certificate_status: string;
  certificate_hours: number;
  certificate_level: number;
  skills: string[];
  provider: string;
}

type RecommendedCertificate = {
  certificate_id: number;
  certificate_name: string;
  certificate_desc: string;
  certificate_link: string;
  provider: string;
  score: number;
  certificate_estimated_time: number;
  certificate_level: number;
  skills: string[];
  compatibility?: number;
};

interface Props {
  userId?: number; // Nuevo: opcional para uso en perfil
}

const FallbackImage = ({ src, fallbackSrc, ...props }: any) => {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      {...props}
      src={imgSrc}
      onError={() => setImgSrc(fallbackSrc)}
      alt={props.alt || "Certificate image"}
    />
  );
};

export default function WidgetCertificaciones({ userId }: Props) {
  const { data: session } = useSession();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<
    Certificate | RecommendedCertificate | null
  >(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [addModalIsOpen, setAddModalIsOpen] = useState(false);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [recommendedCertificates, setRecommendedCertificates] = useState<
    RecommendedCertificate[]
  >([]);

  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);
  };

  const calculateCompatibility = (
    recommendations: RecommendedCertificate[]
  ): RecommendedCertificate[] => {
    const sorted = [...recommendations].sort((a, b) => b.score - a.score);
    const maxScore = sorted[0]?.score || 1;
    const minScore = sorted[sorted.length - 1]?.score || 0;

    return sorted.map((cert, index) => {
      // Normalize score to [0, 1]
      const normalized = (cert.score - minScore) / (maxScore - minScore || 1);

      // Scale to base compatibility range [60, 95]
      const baseCompatibility = 60 + normalized * 35;

      // Add randomness ±2.5%
      const noise = (Math.random() - 0.5) * 5;
      const compatibility = Math.min(
        100,
        Math.max(0, baseCompatibility + noise)
      );

      return {
        ...cert,
        compatibility: Math.round(compatibility),
      };
    });
  };

  const fetchCertificates = async () => {
    try {
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

      const userIds = res.data[0]?.user_id;
      const recommendedRes = await axios.get(
        `${process.env.NEXT_PUBLIC_FLASK_API_URL}/recommend/certificates/${userIds}`,
        {
          headers: {
            "admin-password":
              process.env.NEXT_PUBLIC_FLASK_API_ADMIN_PASSWORD_ML,
          },
        }
      );
      const processedRecommendations = calculateCompatibility(
        recommendedRes.data.recommendations
      );
      setRecommendedCertificates(processedRecommendations);
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

  const inProgress = certificates.filter(
    (cert) => cert.certificate_status === "in progress"
  );

  const hasAccordionContent =
    remainingCompleted.length > 0 ||
    inProgress.length > 0 ||
    recommendedCertificates.length > 0;

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
                <FallbackImage
                  fallbackSrc="/globe.svg"
                  width={300}
                  height={300}
                  src={"/companies/" + certificate.provider + ".svg"}
                  alt={certificate.provider}
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
              <p className="text-lg font-bold mt-2">
                No tienes certificaciones completadas
              </p>
            </div>
          )}
        </div>

        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isExpanded
              ? "max-h-screen opacity-100 overflow-visible"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          {remainingCompleted.length > 0 && (
            <div>
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
                      <FallbackImage
                        fallbackSrc="/globe.svg"
                        width={300}
                        height={300}
                        src={"/companies/" + certificate.provider + ".svg"}
                        alt={certificate.provider}
                        className="w-30 h-30 object-contain"
                      />
                    )}
                    <p className="font-bold mt-1.5">
                      {certificate.certificate_name}
                    </p>
                    <p className="text-xs text-primary mt-1">
                      Completado:{" "}
                      {new Date(
                        certificate.certificate_date
                      ).toLocaleDateString("es-MX", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="text-secondary text-lg mt-4">
            Certificaciones en Curso
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            {inProgress.map((certificate) => (
              <div
                key={certificate.certificate_id}
                onClick={() => {
                  setSelectedCertificate(certificate);
                  setModalIsOpen(true);
                }}
                className="card bg-base-100 flex justify-center items-center p-4 text-center border border-primary rounded-lg hover:bg-base-300 transition duration-200 ease-in-out transform hover:scale-105 cursor-pointer"
              >
                {certificate.provider && (
                  <FallbackImage
                    fallbackSrc="/globe.svg"
                    width={300}
                    height={300}
                    src={"/companies/" + certificate.provider + ".svg"}
                    alt={certificate.provider}
                    className="w-30 h-30 object-contain"
                  />
                )}
                <p className="font-bold mt-1.5">
                  {certificate.certificate_name}
                </p>
                <p className="text-xs text-primary mt-1">
                  Empezado:{" "}
                  {new Date(
                    certificate.certificate_start_date
                  ).toLocaleDateString("es-MX", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Horas Estimadas: {certificate.certificate_hours} horas
                </p>
              </div>
            ))}
            {inProgress.length === 0 && (
              <div className="flex flex-col items-center justify-center col-span-2 md:col-span-4 py-10">
                <PiCertificate className="text-5xl text-primary" />
                <p className="text-lg font-bold mt-2">
                  No tienes certificaciones en curso
                </p>
              </div>
            )}
          </div>
        </div>

        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isExpanded
              ? "max-h-screen opacity-100 overflow-visible"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <p className="text-secondary text-lg mt-2">
            Certificaciones Recomendadas
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            {recommendedCertificates.map((certificate) => (
              <div
                key={certificate.certificate_id}
                onClick={() => {
                  setSelectedCertificate(certificate);
                  setModalIsOpen(true);
                }}
                className="card bg-base-100 flex justify-center items-center p-4 text-center border border-primary rounded-lg hover:bg-base-300 transition duration-200 ease-in-out transform hover:scale-105 cursor-pointer"
              >
                {certificate.provider && (
                  <FallbackImage
                    fallbackSrc="/globe.svg"
                    width={300}
                    height={300}
                    src={"/companies/" + certificate.provider + ".svg"}
                    alt={certificate.provider}
                    className="w-30 h-30 object-contain"
                  />
                )}
                <p className="font-bold mt-1.5">
                  {certificate.certificate_name}
                </p>
                <p className="text-xs text-primary mt-1">
                  Compatibilidad: {certificate.compatibility}%
                </p>
                <div className="flex flex-row mt-2">
                  {certificate.skills.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="badge bg-accent text-base-100 text-xs mr-1 border-0 outline-none hover:outline-none focus:outline-none"
                    >
                      {skill.length > 6 ? skill.slice(0, 6) + ".." : skill}
                    </span>
                  ))}
                  {certificate.skills.length > 3 && (
                    <span className="flex items-center justify-center py-1 px-1 rounded-lg text-center bg-accent text-base-100 text-xs mr-1 border-0 outline-none hover:outline-none focus:outline-none">
                      +{certificate.skills.length - 3}
                    </span>
                  )}
                </div>
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

        {addModalIsOpen && !userId && (
          <AddCertificateModal
            onClose={() => {
              setAddModalIsOpen(false);
              fetchCertificates(); // Refresca
            }}
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
