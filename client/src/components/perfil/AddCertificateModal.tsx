import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { FaCalendarAlt } from "react-icons/fa";

interface AddCertificateModalProps {
  onClose: () => void; // Function to close the modal
}

interface certificates {
    certificate_id: number;
    user_id: number;
    certificate_name: string;
    certificate_desc: string;
    skills: string[];
    provider: string;
}

const AddCertificateModal: React.FC<AddCertificateModalProps> = ({
  onClose,
}) => {
    const { data: session } = useSession();


  const [formData, setFormData] = useState({
    company: "",
    certificate_name: "",
    status: "",
    issue_date: "",
    expiration_date: "",
    link: "",
    skills: [] as string[],
    pdf: null as File | null,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      if (e.target.files && e.target.files[0]) {
        setFormData((prev) => ({ ...prev, pdf: e.target.files?.[0] || null }));
      }
    }
  };

  const handleSkillToggle = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    if (!session || !session.user) {
      console.error("Session is missing or invalid");
      return;
    }

    const sessionKey = session.sessionId; // Retrieve session key from session hook
    if (!sessionKey) {
      console.error("Session key is missing");
      return;
    }

    // Check if the user already has the selected certificate
    const existingCertificate = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE}/course/certificates`,
      {
        headers: {
          "session-key": sessionKey,
        },
      }
    );
    console.log("Existing Certificates:", existingCertificate.data);
    const userCertificates = existingCertificate.data; // Array of user's certificates
    const alreadyExists = userCertificates.some(
      (cert: certificates) =>
        cert.certificate_name === formData.certificate_name
    );

    if (alreadyExists) {
      alert("El usuario ya tiene este certificado.");
      // Reset the form
      setFormData({
        company: "",
        certificate_name: "",
        status: "",
        issue_date: "",
        expiration_date: "",
        link: "",
        skills: [],
        pdf: null,
      });
      return;
    }

    const certificate_id = certifications.find(
      (cert) => cert.certificate_name === formData.certificate_name
    )?.certificate_id;

    if (!certificate_id || !formData.issue_date || !formData.status) {
      console.error("Certificate ID, date, and status are required");
      return;
    }

    const formPayload = new FormData();
    formPayload.append("certificate_id", String(certificate_id));
    formPayload.append("certificate_date", formData.issue_date);
    formPayload.append("certificate_expiration_date", formData.expiration_date || "");
    formPayload.append("certificate_link", formData.link || "");
    formPayload.append("certificate_status", formData.status);
    if (formData.pdf) {
      formPayload.append("pdf", formData.pdf);
    }

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE}/course/add-certificate`,
      formPayload,
      {
        headers: {
          "session-key": sessionKey,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log("Certificate added successfully:", response.data);
    onClose(); // Close the modal after successful submission
  } catch (error) {
    console.error("Error adding certificate:", error);
  }
};

  const companyLogo = formData.company
    ? `/companies/${formData.company.toLowerCase()}.svg`
    : "/placeholder-logo.svg";

  const [providers, setProviders] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<certificates[]>([]);

  useEffect(() => {
    const fetchProvidersAndCertifications = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE}/course/providers-and-certifications`
        );

        const { providers, certifications } = res.data;

        // Update state with fetched data
        setProviders(providers); // Array of unique providers
        setCertifications(certifications); // Array of certifications with details and skills

        console.log("Providers:", providers);
        console.log("Certifications:", certifications);
      } catch (error) {
        console.error("Error fetching providers and certifications:", error);
      }
    };

    fetchProvidersAndCertifications();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <div className="bg-base-100 rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-1/2 p-6 relative flex flex-col gap-6">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Modal Header */}
        <h2 className="text-2xl font-bold text-center">Agregar Certificado</h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex">
            <div className="w-3/4 gap-5 flex flex-col">
              {/* Company */}
              <div>
                <label className="block text-sm font-medium">Empresa</label>
                <select
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="select select-bordered w-full"
                >
                  <option value="" disabled>
                    Selecciona una empresa
                  </option>
                  {providers.map((provider) => (
                    <option key={provider} value={provider}>
                      {provider}
                    </option>
                  ))}
                </select>
              </div>

              {/* Certificate Name */}
              <div>
                <label className="block text-sm font-medium">Certificado</label>
                <select
                  name="certificate_name"
                  value={formData.certificate_name}
                  onChange={handleInputChange}
                  className="select select-bordered w-full"
                >
                  <option value="" disabled>
                    Selecciona un certificado
                  </option>
                  {certifications
                    .filter(
                      (certification) =>
                        certification.provider === formData.company
                    )
                    .map((certification) => (
                      <option
                        key={certification.certificate_id}
                        value={certification.certificate_name}
                      >
                        {certification.certificate_name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium">Estatus</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="select select-bordered w-full"
                >
                  <option value="" disabled>
                    Selecciona un estatus
                  </option>
                  <option value="completed">Completado</option>
                  <option value="expired">Expirado</option>
                  <option value="in progress">En progreso</option>
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">
                    Fecha de Expedición
                  </label>
                  <div className="relative">

                    <input
                      type="date"
                      name="issue_date"
                      value={formData.issue_date}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                    />
                    <div className="absolute right-3 top-6/12 -translate-y-1/2 pointer-events-none">
                      <FaCalendarAlt className="text-gray-400 text-xl" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Fecha de Expiración
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="expiration_date"
                      value={formData.expiration_date}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                    />
                    <div className="absolute right-3 top-6/12 -translate-y-1/2 pointer-events-none">
                      <FaCalendarAlt className="text-gray-400 text-xl" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Link */}
              <div>
                <label className="block text-sm font-medium">Link</label>
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  placeholder="Link"
                />
              </div>
            </div>

            <div className="w-1/4 ml-4">
              {/* Company Logo */}
                {formData.company && (
                <div className="flex justify-center">
                  <Image
                  width={100}
                  height={100}
                  src={companyLogo}
                  alt="Company Logo"
                  className="w-24 h-24 object-contain"
                  />
                </div>
                )}

              {/* Skills */}
              <div className="mt-5">
                <label className="block text-sm font-medium">Skills</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {certifications
                    .find(
                      (certification) =>
                        certification.certificate_name ===
                        formData.certificate_name
                    )
                    ?.skills.map((skill) => (
                      <span
                        key={skill}
                        onClick={() => handleSkillToggle(skill)}
                        className={`badge cursor-pointer ${
                          formData.skills.includes(skill)
                            ? "badge-primary"
                            : "badge-outline"
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                </div>
              </div>

              {/* PDF Upload */}
              <div className="mt-10">
                <label className="block text-sm font-medium">
                  PDF Certificate
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="file-input file-input-bordered w-full"
                />
                {formData.pdf ? (
                  <div className="mt-2 text-success text-xs">Archivo cargado: {formData.pdf.name}</div>
                ) : (
                  <div className="mt-2 text-xs text-gray-400">Ningún archivo cargado</div>
                )}
              </div>
            </div>
          </div>

                   {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={formData.status === "expired" || formData.status === "in progress"}
          >
            Guardar Certificado
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCertificateModal;
