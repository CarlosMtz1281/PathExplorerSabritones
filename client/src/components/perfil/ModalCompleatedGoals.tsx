import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

interface MetaSkill {
  skill_id: number;
  skill_name: string;
}

interface Meta {
  goal_id: number;
  goal_name: string;
  goal_desc: string;
  skills: MetaSkill[];
  priority?: string;
}

const ModalCompleatedGoals = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose?: () => void;
}) => {
  const [search, setSearch] = useState("");
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    axios
      .get(`${process.env.NEXT_PUBLIC_API_BASE}/employee/completed-goals`, {
        headers: {
          "session-key": session?.sessionId,
        },
      })
      .then((res) => {
        // Flatten the structure to match Meta interface
        const metas = res.data.map((item: any) => ({
          goal_id: item.goal.goal_id,
          goal_name: item.goal.goal_name,
          goal_desc: item.goal.goal_desc,
          skills: item.goal.skills,
          priority: item.goal.priority,
        }));
        setMetas(metas);
      })
      .catch(() => setMetas([]))
      .finally(() => setLoading(false));

    // Prevent body scroll when modal is open
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, session]);

  if (!isOpen) return null;

  const priorityIcon = {
    Alta: (
      <svg width="25" height="25" fill="none" viewBox="0 0 24 24">
        <path
          d="M12 19V5M12 5l-5 5M12 5l5 5"
          stroke="red"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    Media: (
      <svg width="25" height="25" fill="none" viewBox="0 0 24 24">
        <path
          d="M5 12h14"
          stroke="#f59e42"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    Baja: (
      <svg width="25" height="25" fill="none" viewBox="0 0 24 24">
        <path
          d="M12 5v14M12 19l-5-5M12 19l5-5"
          stroke="#22c55e"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  };

  // Map backend priority to display
  const getPriorityLabel = (priority?: string) => {
    if (!priority) return "Media";
    if (priority.toLowerCase() === "alta" || priority.toLowerCase() === "high")
      return "Alta";
    if (priority.toLowerCase() === "baja" || priority.toLowerCase() === "low")
      return "Baja";
    return "Media";
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-8 relative">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 bg-purple-200 hover:bg-purple-300 text-purple-700 rounded-full w-10 h-10 flex items-center justify-center text-2xl"
          onClick={onClose}
        >
          ×
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-6 text-black text-left">
          Metas Completadas
        </h2>

        {/* Search */}
        <div className="flex items-center mb-4 gap-4">
          <input
            type="text"
            placeholder="Buscar..."
            className="flex-1 px-4 py-2 rounded-lg border-2 border-purple-200 focus:outline-none focus:border-purple-400 bg-purple-50 text-lg text-black"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Goals List */}
        <div className="flex flex-col gap-4 max-h-[55vh] overflow-y-auto">
          {loading ? (
            <div className="text-center text-gray-400 py-10">Cargando...</div>
          ) : (
            (() => {
              const filtered = metas.filter((meta) =>
                meta.goal_name.toLowerCase().includes(search.toLowerCase())
              );
              if (filtered.length === 0) {
                return (
                  <div className="text-center text-gray-400 py-10">
                    Ninguna meta completada con esos filtros
                  </div>
                );
              }
              return filtered.map((meta) => {
                const priorityLabel = getPriorityLabel(meta.priority);
                return (
                  <div
                    key={meta.goal_id}
                    className="border border-gray-300 rounded-xl p-4 flex items-center gap-4 bg-white relative"
                  >
                    <div className="flex flex-col items-center justify-center min-w-[60px]">
                      <div className="flex gap-1">
                        <svg
                          width="40"
                          height="40"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <rect
                            x="3"
                            y="3"
                            width="18"
                            height="6"
                            rx="1"
                            stroke="black"
                            strokeWidth="2"
                          />
                          <rect
                            x="3"
                            y="15"
                            width="18"
                            height="6"
                            rx="1"
                            stroke="black"
                            strokeWidth="2"
                          />
                          <rect
                            x="7"
                            y="9"
                            width="10"
                            height="6"
                            rx="1"
                            stroke="black"
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                    </div>
                    {/* Icon */}

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-left">
                        <h3 className="font-bold text-lg text-left">
                          {meta.goal_name}
                        </h3>
                      </div>
                      <p className="text-gray-700 text-left text-sm">
                        {meta.goal_desc}
                      </p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {meta.skills.map((tag) => (
                          <span
                            key={tag.skill_id}
                            className="border border-purple-500 text-purple-500 px-4 py-1 rounded-full text-sm"
                          >
                            {tag.skill_name}
                          </span>
                        ))}
                      </div>
                    </div>
                    {/* Priority */}
                    <div className="flex flex-col items-end justify-between h-full min-w-[120px]">
                      <span className="text-sm text-gray-700">
                        Prioridad: {priorityLabel}
                        <div className="flex flex-col items-center justify-center min-w-[60px]">
                          <div className="flex gap-1">
                            {
                              priorityIcon[
                                priorityLabel as "Alta" | "Media" | "Baja"
                              ]
                            }
                          </div>
                        </div>
                      </span>
                    </div>
                  </div>
                );
              });
            })()
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalCompleatedGoals;
