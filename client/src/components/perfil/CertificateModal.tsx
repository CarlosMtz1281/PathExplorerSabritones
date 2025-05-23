import React from "react";
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

type CertificateModalProps = {
  certificate: Certificate | RecommendedCertificate;
  onClose: () => void;
};

const CertificateModal: React.FC<CertificateModalProps> = ({
  certificate,
  onClose,
}) => {
  const MAX_FILE_SIZE_MB = 5; // 5 MB
  const levelTranslation: Record<number, string> = {
    0: "Sin nivel",
    1: "Básico",
    2: "Intermedio",
    3: "Avanzado",
    4: "Experto",
  };
  const isCompleted =
    "certificate_expiration_date" in certificate &&
    certificate.certificate_status === "completed";
  const isProgress =
    "certificate_expiration_date" in certificate &&
    certificate.certificate_status === "in progress";

  const isRecommended = "score" in certificate;

  const [isMoreMB, setIsMoreMB] = React.useState(false);
  const [file, setFile] = React.useState<File | null | undefined>(null);

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <div className="bg-base-100 rounded-lg shadow-lg md:w-3/4 lg:w-1/2 p-6 relative flex flex-col w-max">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Certificate Header */}
        <div className="flex items-center gap-4 mb-4">
          {certificate.provider && (
            <Image
              width={300}
              height={300}
              src={"/companies/" + certificate.provider + ".svg"}
              alt={certificate.certificate_name}
              className="w-30 h-30 object-contain"
            />
          )}
          <h2 className="text-2xl font-bold ml-5">
            {certificate.certificate_name}
          </h2>
        </div>

        {/* Certificate Description */}
        <div className="flex">
          <div className="w-7/12 border-r border-gray-300 pl-5 pr-3">
            <h3 className="text-xl font-semibold">¿De qué trata?</h3>
            <p className="p-4 text-justify">{certificate.certificate_desc}</p>
            {/* Skills */}
            <div className="mt-5">
              <h3 className="text-lg font-semibold">Skills</h3>
              <div className="flex flex-wrap gap-2 mt-2 pb-8 pl-4">
                {certificate.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="badge badge-outline badge-primary text-sm px-4 py-2"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="px-10 w-5/12">
            {isCompleted && (
              <div className=" mt-5">
                <div>
                  <h4 className="font-semibold text-base">
                    Fecha de Acreditación:
                  </h4>
                  <p>
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
                <div>
                  <h4 className="font-semibold mt-3 text-base">
                    Fecha de Expiración:
                  </h4>
                  <p>
                    {new Date(
                      certificate.certificate_expiration_date
                    ).toLocaleDateString("es-MX", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}

            {isProgress && (
              <div className=" mt-5">
                <div>
                  <h4 className="font-semibold text-base">Fecha de Inicio:</h4>
                  <p>
                    {new Date(
                      certificate.certificate_start_date
                    ).toLocaleDateString("es-MX", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mt-3 text-base">
                    Horas Estimadas:
                  </h4>
                  <p>{certificate.certificate_hours} horas</p>
                </div>
              </div>
            )}

            {isRecommended && (
              <div>
                <div className="mb-8">
                  <h4 className="font-semibold text-base mb-1">
                    Compatibilidad:
                  </h4>
                  <div className="flex w-full justify-center">
                    <div
                      className="radial-progress text-primary text-lg font-bold"
                      style={
                        {
                          ["--value" as any]: certificate.compatibility,
                          ["--size" as any]: "7rem",
                          ["--thickness" as any]: "0.6rem",
                        } as React.CSSProperties
                      }
                      aria-valuenow={certificate.compatibility}
                      role="progressbar"
                    >
                      {certificate.compatibility}%
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-base">Nivel:</h4>
                  <p>{levelTranslation[certificate.certificate_level]}</p>
                </div>
                <div>
                  <h4 className="font-semibold mt-3 text-base">
                    Horas Estimadas:
                  </h4>
                  <p>{certificate.certificate_estimated_time} horas</p>
                </div>
              </div>
            )}

            {/* View Certificate Button */}
            {isCompleted ? (
              <div className="flex mt-15">
                <button
                  disabled
                  className="btn btn-primary opacity-50 cursor-not-allowed"
                >
                  Ver Certificado
                </button>
              </div>
            ) : (
              <div className="mt-5"></div>
            )}

            {isProgress && (
              <div className="mt-10">
                <p className="font-semibold text-base mb-2">
                  Subir Certificado
                </p>
                <fieldset className="fieldset">
                  <input
                    type="file"
                    className="file-input file-input-sm"
                    accept="application/pdf,image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                        setIsMoreMB(true);
                        setFile(null);
                      } else {
                        setIsMoreMB(false);
                        setFile(file);
                      }
                    }}
                  />
                  {!isMoreMB && (
                    <label className="label">
                      Max size {MAX_FILE_SIZE_MB}MB
                    </label>
                  )}
                  {isMoreMB && (
                    <span className="text-error">
                      ¡El archivo pesa más de {MAX_FILE_SIZE_MB}MB!
                    </span>
                  )}

                  <button className="btn btn-primary mt-4" disabled={!file}>
                    Subir
                  </button>
                </fieldset>
              </div>
            )}
          </div>
        </div>

        {/* Certificate Dates */}
      </div>
    </div>
  );
};

export default CertificateModal;
