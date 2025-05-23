import React, { useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

interface EditGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalId: number;
  goalName: string;
  currentPriority: "Alta" | "Media" | "Baja";
  onGoalUpdated?: () => void;
}

const priorityIcon = {
  Alta: (
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
  Media: (
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
  Baja: (
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

const EditGoalModal: React.FC<EditGoalModalProps> = ({
  isOpen,
  onClose,
  goalId,
  goalName,
  currentPriority,
  onGoalUpdated,
}) => {
  const [priority, setPriority] = useState<"Alta" | "Media" | "Baja">(currentPriority);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  if (!isOpen) return null;

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPriority(e.target.value as "Alta" | "Media" | "Baja");
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE}/employee/goals`,
        {
          goal_id: goalId,
          priority: priority,
          completed: false
        },
        {
          headers: {
        "session-key": session?.sessionId,
        "Content-Type": "application/json"
          }
        }
      );
      alert("Meta actualizada exitosamente.");
      if (onGoalUpdated) onGoalUpdated();
      onClose();
    } catch (error: any) {
      alert(
        error?.response?.data?.error ||
          "Ocurrió un error al actualizar la meta."
      );
    } finally {
      setLoading(false);
    }
  };
  
  const handleComplete = async () => {
    if (!window.confirm("¿Estás seguro de que quieres completar esta meta?")) return;
    setLoading(true);
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE}/employee/goals`,
        {
          goal_id: goalId,
          priority: priority,
          completed: false
        },
        {
          headers: {
        "session-key": session?.sessionId,
        "Content-Type": "application/json"
          }
        }
      );
      alert("Meta completada exitosamente.");
      if (onGoalUpdated) onGoalUpdated();
      onClose();
    } catch (error: any) {
      alert(
        error?.response?.data?.error ||
          "Ocurrió un error al completar la meta."
      );
      onClose();
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8 relative">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 bg-purple-200 hover:bg-purple-300 text-purple-700 rounded-full w-8 h-8 flex items-center justify-center text-xl"
          onClick={onClose}
        >
          ×
        </button>

        <h2 className="text-2xl font-bold mb-6 text-black text-left">
          Editar Meta
        </h2>

        <div className="mb-6">
          <div className="font-semibold mb-2">Meta:</div>
          <div className="text-lg mb-4">{goalName}</div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-700">Prioridad:</label>
            <select
              className="px-4 py-2 rounded-lg border-2 border-purple-200 focus:outline-none focus:border-purple-400 bg-purple-50 text-lg text-black"
              value={priority}
              onChange={handlePriorityChange}
              disabled={loading}
            >
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
            {priorityIcon[priority]}
          </div>
        </div>

        <div className="flex justify-between mt-8 gap-2">
          <button
            className="bg-accent text-white font-bold py-2 px-6 rounded-lg cursor-pointer"
            onClick={handleUpdate}
            disabled={loading}
          >
            Actualizar Meta
          </button>
          <button
            className="bg-primary  text-white font-bold py-2 px-6 rounded-lg cursor-pointer"
            onClick={handleComplete}
            disabled={loading}
          >
            Completar Meta
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditGoalModal;