import React from "react";
import Image from "next/image";

interface Certificate {
  certificate_name: string;
  certificate_desc: string;
  certificate_date: string;
  certificate_expiration_date: string;
  certificate_link: string;
  skills: string[];
  provider: string;
}

interface CertificateModalProps {
  certificate: Certificate;
  onClose: () => void; // Function to close the modal
}

const CertificateModal: React.FC<CertificateModalProps> = ({
  certificate,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <div className="bg-base-100 rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-1/2 p-6 relative flex flex-col ">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Certificate Header */}
        <div className="flex items-center gap-4">
          {certificate.provider && (
            <Image
              width={300}
              height={300}
              src={"/companies/" + certificate.provider + ".svg"}
              alt={certificate.certificate_name}
              className="w-30 h-30 object-contain"
            />
          )}
          <h2 className="text-2xl font-bold ml-5">{certificate.certificate_name}</h2>
        </div>

        {/* Certificate Description */}
        <div className="flex">
          <div className="w-1/2">
            <h3 className="text-lg font-semibold">Descripción</h3>
            <p className="bg-accent  p-4 rounded-lg">
              {certificate.certificate_desc}
            </p>
          </div>

          <div className="ml-10">
            <div className=" mt-5">
              <div>
                <h4 className="font-semibold text-base">Fecha de Acreditación:</h4>
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
                <h4 className="font-semibold mt-3 text-base">Fecha de Expiración:</h4>
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

            {/* Skills */}
            <div className="mt-5">
              <h3 className="text-lg font-semibold">Skills</h3>
              <div className="flex flex-wrap gap-2 mt-2">
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

            {/* View Certificate Button */}
            <div className="flex mt-15">
              <a
                href={certificate.certificate_link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Ver Certificado
              </a>
            </div>
          </div>
        </div>

        {/* Certificate Dates */}
      </div>
    </div>
  );
};

export default CertificateModal;
