"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ReactDOM from "react-dom";
import {
  FaInfoCircle,
  FaRegCommentDots,
  FaRegCalendar,
  FaRegBuilding,
} from "react-icons/fa";

type PropsModal = {
  toggleModal: () => void;
};

// Feedback popup as fixed portal
const FeedbackPopup = ({ top, left, value, onChange, onClose }: any) => {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return ReactDOM.createPortal(
    <div
      ref={popupRef}
      className="fixed bg-base-100 border rounded-lg shadow-lg w-[400px] p-3 z-[9999]"
      style={{ top, left }}
    >
      <p className="font-bold mb-1">Feedback</p>
      <textarea
        className="textarea textarea-bordered w-full h-24 focus:outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button className="btn btn-xs btn-primary mt-2 float-right">
        Guardar
      </button>
    </div>,
    document.body
  );
};

const SubordinateCard = ({
  subordinate,
  onFeedbackToggle,
  isFeedbackOpen,
}: {
  subordinate: any;
  onFeedbackToggle: (id: number, e: React.MouseEvent) => void;
  isFeedbackOpen: boolean;
}) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/dashboard/info-colegas/${subordinate.id}`);
  };

  return (
    <div
      key={subordinate.id}
      className="bg-base-100 p-4 rounded-lg border border-base-300 flex flex-col gap-2 relative"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="avatar mr-4">
            <div className="w-16 h-16 rounded-lg">
              <Image
                width={96}
                height={96}
                src="/profilePhoto.jpg"
                alt={`Foto de ${subordinate.name}`}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
          <div>
            <h4 className="font-bold text-lg">{subordinate.name}</h4>
            <p className="text-sm text-gray-600">
              {subordinate.position} {subordinate.level}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="rating rating-lg mr-30">
            {[1, 2, 3, 4, 5].map((star) => (
              <input
                key={star}
                type="radio"
                name={`rating-${subordinate.id}`}
                className="mask mask-star-2 bg-yellow-500"
                aria-label={`${star} star`}
              />
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <FaInfoCircle
              className="text-xl cursor-pointer"
              title="Info"
              onClick={handleClick}
            />
            <FaRegCommentDots
              className="text-xl cursor-pointer"
              title="Feedback"
              onMouseDown={(e) => onFeedbackToggle(subordinate.id, e)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const SubordinatesList = ({ subordinates }: { subordinates: any[] }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState<Record<number, string>>({});
  const [popupPos, setPopupPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedId(null);
  };

  const handleToggleFeedback = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const offsetY = 30;

    setPopupPos({
      top: rect.top + window.scrollY + offsetY,
      left: rect.left - 360,
    });

    if (selectedId === id) {
      closePopup();
      return;
    }

    setSelectedId(id);
    setIsPopupOpen(true);
  };

  return (
    <div className="flex flex-col min-h-[50vh] max-h-[50vh] gap-4 bg-base-200 p-6 overflow-y-auto rounded-2xl">
      {subordinates.map((subordinate: any) => (
        <SubordinateCard
          key={subordinate.id}
          subordinate={subordinate}
          onFeedbackToggle={handleToggleFeedback}
          isFeedbackOpen={isPopupOpen}
        />
      ))}

      {isPopupOpen && selectedId !== null && (
        <FeedbackPopup
          top={popupPos.top}
          left={popupPos.left}
          value={feedbackText[selectedId] || ""}
          onChange={(val: string) =>
            setFeedbackText((prev) => ({ ...prev, [selectedId]: val }))
          }
          onClose={() => {
            closePopup();
          }}
        />
      )}
    </div>
  );
};

const ModalFeedback = ({ toggleModal }: PropsModal) => {
  const [isProjectTerminating, setIsProjectTerminating] = useState(false);
  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <div className="bg-base-100 rounded-lg h-9/12 shadow-lg w-9/12 p-12 relative flex flex-col gap-6">
        <div className="flex flex-row">
          <p className="font-bold text-3xl">Detalles de Migración a la nube</p>
          <button
            className="btn btn-lg btn-circle btn-ghost absolute right-4 top-4"
            onClick={toggleModal}
          >
            ✕
          </button>
        </div>

        {isProjectTerminating ? (
          <div className="flex flex-col justify-center items-center h-full text-center gap-6">
            <p className="text-2xl font-semibold text-gray-800">
              ¿Estás seguro que deseas terminar el proyecto?
            </p>
            <p className="text-gray-500">Esta acción es irreversible.</p>
            <div className="flex gap-4">
              <button
                className="btn btn-outline"
                onClick={() => setIsProjectTerminating(false)}
              >
                Cancelar
              </button>
              <button
                className="btn btn-error text-white px-6"
                onClick={() => {
                  toggleModal();
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-row gap-4 h-full">
            <div className="flex flex-col w-1/3 h-full gap-8">
              <div className="flex items-center text-lg mt-5">
                <FaRegCalendar className="text-xl" />
                <span className="ml-2">Fecha</span>
              </div>
              <div className="flex items-center text-lg">
                <FaRegBuilding className="text-xl" />
                <span className="ml-2">Empresa</span>
              </div>
              <div>
                <p className="text-lg font-bold">Descripcion</p>
                <p className="text-gray-600">
                  Migración de infraestructura a la nube para mejorar la
                  escalabilidad y reducir costos operativos.
                </p>
              </div>
              <div>
                <p className="text-lg font-bold">Filtrar por Rol</p>
                <select className="select select-bordered w-full mt-2 focus:outline-none">
                  <option value="all">Todos</option>
                  <option value="developer">Desarrollador</option>
                  <option value="designer">Diseñador</option>
                  <option value="manager">Gerente de Proyectos</option>
                  <option value="analyst">Analista de Datos</option>
                  <option value="tester">Tester</option>
                </select>
              </div>
              <div className="justify-end flex-1 flex items-end">
                <button
                  className="btn btn-primary border-0 px-10 py-5 w-full mb-3"
                  onClick={() => setIsProjectTerminating(true)}
                >
                  Terminar Proyecto
                </button>
              </div>
            </div>
            <div className="w-2/3 h-full flex flex-col">
              <div className="overflow-y-auto">
                <SubordinatesList
                  subordinates={[
                    {
                      id: 1,
                      name: "Juan Pérez",
                      position: "Desarrollador",
                      level: "Senior",
                    },
                    {
                      id: 2,
                      name: "Ana Gómez",
                      position: "Diseñadora",
                      level: "Junior",
                    },
                    {
                      id: 3,
                      name: "Luis Rodríguez",
                      position: "Gerente de Proyectos",
                      level: "Senior",
                    },
                    {
                      id: 4,
                      name: "María López",
                      position: "Analista de Datos",
                      level: "Intermedio",
                    },
                    {
                      id: 5,
                      name: "Carlos Sánchez",
                      position: "Tester",
                      level: "Junior",
                    },
                  ]}
                />
              </div>
              <div className="flex w-full items-center justify-end mt-4 flex-1 pr-5">
                <button className="btn btn-primary border-0 px-10">
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalFeedback;
