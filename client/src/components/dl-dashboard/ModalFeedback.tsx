"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import ReactDOM from "react-dom";
import {
  FaInfoCircle,
  FaRegCommentDots,
  FaRegCalendar,
  FaRegBuilding,
} from "react-icons/fa";
import axios from "axios";

type Feedback = {
  feedback_id: number;
  desc: string;
  score: number;
};

type Employee = {
  user_id: number;
  name: string;
  position_name: string;
  position_id: number;
  feedbacks: Feedback[];
};

type PropsModal = {
  project: {
    id: number;
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    company: string;
  };
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

  return (
    <div
      ref={popupRef}
      className="absolute bg-base-100 border rounded-lg shadow-lg w-[400px] p-3 z-[9999]"
      style={{ top, left }}
    >
      <p className="font-bold mb-1">Feedback</p>
      <textarea
        className="textarea textarea-bordered w-full h-24 focus:outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

const SubordinateCard = ({
  subordinate,
  onFeedbackToggle,
  score,
  setScore,
}: {
  subordinate: Employee;
  onFeedbackToggle: (id: number, e: React.MouseEvent) => void;
  score: number;
  setScore: (score: number) => void;
}) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/dashboard/info-colegas/${subordinate.user_id}`);
  };

  return (
    <div className="bg-base-100 p-4 rounded-lg border border-base-300 flex flex-col gap-2 relative">
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
            <p className="text-sm text-gray-600">{subordinate.position_name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="rating rating-lg mr-30">
            {[1, 2, 3, 4, 5].map((star) => (
              <input
                key={star}
                aria-label={`${star} star`}
                type="radio"
                name={`rating-${subordinate.user_id}`}
                className="mask mask-star-2 bg-orange-400"
                defaultChecked={subordinate.feedbacks[0]?.score === star}
                onChange={() => setScore(star)}
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
              onMouseDown={(e) => onFeedbackToggle(subordinate.user_id, e)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const SubordinatesList = ({
  subordinates,
  feedbackText,
  changeFeedback,
  scoreState,
  setScore,
}: {
  subordinates: any[];
  feedbackText: Record<number, string>;
  changeFeedback: (id: number, value: string) => void;
  scoreState: Record<number, number>;
  setScore: (id: number, score: number) => void;
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedId(null);
  };

  const handleToggleFeedback = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();

    const button = event.currentTarget as HTMLElement;
    const container = containerRef.current;
    if (!container) return;

    const buttonRect = button.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Compute position relative to the scroll container
    const top = buttonRect.top - containerRect.top + container.scrollTop + 8; // 8px padding below button
    const left = buttonRect.left - containerRect.left - 420; // Popup appears to the left

    const maxTop = container.scrollHeight - 150;
    setPopupPos({ top: Math.min(top, maxTop), left });

    if (selectedId === id) {
      closePopup();
      return;
    }

    setSelectedId(id);
    setIsPopupOpen(true);
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col min-h-[50vh] max-h-[50vh] gap-4 bg-base-200 p-6 overflow-y-auto rounded-2xl relative"
    >
      {subordinates.map((subordinate: any) => (
        <SubordinateCard
          key={subordinate.user_id}
          subordinate={subordinate}
          onFeedbackToggle={handleToggleFeedback}
          score={scoreState[subordinate.user_id] || 0}
          setScore={(score: number) => setScore(subordinate.user_id, score)}
        />
      ))}

      {isPopupOpen && selectedId !== null && (
        <FeedbackPopup
          top={popupPos.top}
          left={popupPos.left}
          value={feedbackText[selectedId] || ""}
          onChange={(val: string) => changeFeedback(selectedId, val)}
          onClose={() => {
            closePopup();
          }}
        />
      )}
    </div>
  );
};

const ModalFeedback = ({ project, toggleModal }: PropsModal) => {
  const { data: session } = useSession();
  const [isProjectTerminating, setIsProjectTerminating] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [feedbackText, setFeedbackText] = useState<Record<number, string>>({});
  const [scoreState, setScoreState] = useState<Record<number, number>>({});

  const fetchData = async () => {
    try {
      const sessionId = session?.sessionId;
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE}/project/employeesByProject/${project.id}`,
        { headers: { "session-key": sessionId } }
      );
      setEmployees(response.data.employees);
      setRoles(response.data.uniqueRoles);
      const initialFeedback: Record<number, string> = {};
      const initialScore: Record<number, number> = {};
      response.data.employees.forEach((emp: Employee) => {
        initialFeedback[emp.user_id] = emp.feedbacks[0]?.desc || "";
        initialScore[emp.user_id] = emp.feedbacks[0]?.score || 0;
      });
      setFeedbackText(initialFeedback);
      setScoreState(initialScore);
    } catch (error) {
      alert("Error al obtener los empleados del proyecto");
    }
  };

  const handleTerminateProject = async () => {
    try {
      const sessionId = session?.sessionId;
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE}/project/closeProject`,
        { projectId: project.id },
        { headers: { "session-key": sessionId } }
      );
      toggleModal();
    } catch (error) {
      alert("Error al terminar el proyecto");
    }
  };

  useEffect(() => {
    if (selectedRole === "all") {
      setFilteredEmployees(employees);
    } else {
      setFilteredEmployees(
        employees.filter((employee) => employee.position_name === selectedRole)
      );
    }
  }, [selectedRole, employees]);

  useEffect(() => {
    fetchData();
  }, [project.id, session]);

  const changeFeedback = (id: number, value: string) => {
    setFeedbackText((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSaveFeedbacks = async () => {
    try {
      const sessionId = session?.sessionId;

      const feedbacksToSubmit = employees
        .map((emp) => {
          const feedback = emp.feedbacks[0];

          return {
            feedback_id: feedback?.feedback_id,
            position_id: emp.position_id,
            desc: feedbackText[emp.user_id] || "",
            score: scoreState[emp.user_id] || 0,
          };
        })
        .filter(
          (feedback) => feedback.desc.trim() !== "" || feedback.score > 0
        );

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}/project/feedbacks`,
        {
          projectId: project.id,
          feedbacks: feedbacksToSubmit,
        },
        {
          headers: { "session-key": sessionId },
        }
      );

      alert("Feedbacks guardados correctamente");
    } catch (error) {
      alert("Error al guardar feedbacks");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <div className="bg-base-100 rounded-lg h-9/12 shadow-lg w-9/12 p-12 relative flex flex-col gap-6">
        <div className="flex flex-row">
          <p className="font-bold text-3xl">Detalles de {project.name}</p>
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
                onClick={handleTerminateProject}
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
                <span className="ml-2">
                  {project.start_date} - {project.end_date}
                </span>
              </div>
              <div className="flex items-center text-lg">
                <FaRegBuilding className="text-xl" />
                <span className="ml-2">{project.company}</span>
              </div>
              <div>
                <p className="text-lg font-bold">Descripcion</p>
                <p className="text-gray-600">{project.description}</p>
              </div>
              <div>
                <p className="text-lg font-bold">Filtrar por Rol</p>
                <select
                  className="select select-bordered w-full mt-2 focus:outline-none"
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                  }}
                >
                  <option value="all">Todos</option>
                  {roles.map((role, index) => (
                    <option key={index} value={role}>
                      {role}
                    </option>
                  ))}
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
                  subordinates={filteredEmployees}
                  feedbackText={feedbackText}
                  changeFeedback={changeFeedback}
                  scoreState={scoreState}
                  setScore={(id: number, score: number) => {
                    setScoreState((prev) => ({
                      ...prev,
                      [id]: score,
                    }));
                  }}
                />
              </div>
              <div className="flex w-full items-center justify-end mt-4 flex-1 pr-5">
                <button
                  className="btn btn-primary border-0 px-10"
                  onClick={handleSaveFeedbacks}
                >
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
