import React, { useEffect, useState } from "react";
import { FaPlus, FaEdit } from "react-icons/fa";
import { MdKeyboardArrowRight } from "react-icons/md";
import axios from "axios";
import { useSession } from "next-auth/react";
import ModalAddMetas from "./ModalAddMetas";
import EditGoalModal from "./EdtCertificatModal";
import ModalCompleatedGoals from "./ModalCompleatedGoals";

// This interface matches the structure returned by your endpoint

export interface GoalSkill {
  skill_id: number;
  skill_name: string;
}

export interface GoalItem {
  user_id: number;
  goal_id: number;
  created_at: string;
  completed: boolean;
  goal: {
    goal_name: string;
    goal_desc: string;
    skills: GoalSkill[];
  };
    priority: "high" | "medium" | "low";
}

const priorityIcon = {
  high: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 19V5M12 5l-5 5M12 5l5 5"
        stroke="red"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  medium: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
      <path
        d="M5 12h14"
        stroke="#f59e42"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  low: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
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

const WidgetMetas = () => {
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [loading, setLoading] = useState(true);
    const { data: session } = useSession(); 
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [editModalIsOpen, setEditModalIsOpen] = useState(false);
    const [currentGoal, setCurrentGoal] = useState<GoalItem | null>(null);
    const [ModalCompleatedGoalsIsOpen, setModalCompleatedGoalsIsOpen] = useState(false);

  // Move fetchGoals to component scope so it can be reused
  const fetchGoals = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/employee/goals`, {
        headers: {
          "session-key": session?.sessionId,
        },
      });
      setGoals(response.data);
      console.log(response.data);

    } catch (error) {
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  return (
    <div className="w-full bg-base-100 rounded-xl border border-gray-300 p-4 flex flex-col relative">
      {/* Header */}
      <div className="flex items-center mb-6">
        <span className="text-3xl mr-3">
          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 17.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1.5M21 12h-8m0 0 3-3m-3 3 3 3" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </span>
        <h2 className="text-3xl font-bold">Mis Objetivos</h2>
        <button className="ml-auto bg-purple-300 hover:bg-purple-400 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl">
          <FaPlus onClick={() => setModalIsOpen(true)}/>
        </button>
        <ModalAddMetas
                isOpen={modalIsOpen}
                onClose={() => setModalIsOpen(false)}
            />
      </div>

      {/* Goals List */}
      <div className="flex-1 flex flex-col gap-4">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <span className="text-gray-400">Cargando...</span>
          </div>
        ) : goals.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <span className="text-gray-400">No hay objetivos recientes.</span>
          </div>
        ) : (
          goals
            .filter((meta) => !meta.completed)
            .map((meta, idx) => (
            <div key={idx} className="border border-gray-400 rounded-xl p-4 flex items-center gap-4 bg-white">
              {/* Icons (placeholder) */}
              <div className="flex flex-col items-center justify-center min-w-[60px]">
                <div className="flex gap-1">
                  {/* You can replace this with dynamic icons based on meta.goal.skills */}
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="6" rx="1" stroke="black" strokeWidth="2"/><rect x="3" y="15" width="18" height="6" rx="1" stroke="black" strokeWidth="2"/><rect x="7" y="9" width="10" height="6" rx="1" stroke="black" strokeWidth="2"/></svg>
                </div>
              </div>
              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg">{meta.goal.goal_name || "Objetivo"}</h3>
                  {/* Trending icon placeholder */}
                    
                    {priorityIcon[meta.priority]}
                  
                </div>
                <p className="text-gray-700">{meta.goal.goal_desc}</p>
                <div className="flex gap-2 mt-2">
                  {meta.goal.skills.map((tag, i) => (
                    <span key={i} className="border border-purple-500 text-purple-500 px-4 py-1 rounded-full text-sm">{tag.skill_name}</span>
                  ))}
                </div>
              </div>
              {/* Date & Edit */}
              <div className="flex flex-col items-end justify-between h-full min-w-[160px]">
                <button className="bg-purple-200 hover:bg-purple-300 text-purple-700 rounded-full p-2 mb-2">
                  <FaEdit onClick={() => { setEditModalIsOpen(true); setCurrentGoal(meta); }} />
                </button>

                
                <span className="italic text-gray-600 text-sm">
                  {new Date(meta.created_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  - Presente
                </span>
              </div>
            </div>
          ))
        )}
      </div>

        {currentGoal && (
          <EditGoalModal
            isOpen={editModalIsOpen}
            onClose={() => setEditModalIsOpen(false)}
            goalName={currentGoal.goal.goal_name}
            goalId={currentGoal.goal_id}
            currentPriority={currentGoal.priority }
            onGoalUpdated={() => {
              // Fetch updated goals after editing
              fetchGoals();
            }}
          />
        )}

      <ModalCompleatedGoals
        isOpen={ModalCompleatedGoalsIsOpen}
        onClose={() => setModalCompleatedGoalsIsOpen(false)}
        />

      {/* Bottom Controls */}
      <div className="flex items-center justify-between mt-8">
        
        <button className="ml-auto hover:text-bold  rounded-xl px-8 py-3 text-lg font-semibold  hover:text-primary flex items-center gap-2 cursor-pointer" onClick={() => setModalCompleatedGoalsIsOpen(true)}>
          Ver Metas Completadas <MdKeyboardArrowRight className="inline" />
        </button>
      </div>
    </div>
  );
};

export default WidgetMetas;