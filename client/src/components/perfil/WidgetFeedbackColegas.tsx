// WidgetFeedbackColegas.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FaStar, FaArrowDown, FaArrowUp } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

interface Feedback {
  feedback_id: number;
  project_id: number;
  user_id: number;
  desc: string;
  score: number;
  Projects: {
    project_name: string;
  };
}

const WidgetFeedbackColegas = ({ userId }: { userId: number }) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE}/employee/experience?userId=${userId}`
        );
  
        const feedbacksFromProjects = res.data.projects
          .filter((p: any) => p.feedbackDesc && p.feedbackDesc.trim() !== "")
          .map((p: any, i: number) => ({
            feedback_id: i + 1,
            project_id: i + 100, // si no tienes un ID real
            user_id: userId,
            desc: p.feedbackDesc,
            score: p.feedbackScore || 0,
            Projects: {
              project_name: p.projectName || "Proyecto Desconocido",
            },
          }));
  
        setFeedbacks(feedbacksFromProjects);
      } catch (err) {
        console.error("Error loading feedback:", err);
      }
    };
  
    fetchFeedback();
  }, [userId]);
  

  const renderStars = (score: number) => {
    return (
      <div className="flex text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <FaStar key={i} className={i < score ? "" : "text-gray-300"} />
        ))}
      </div>
    );
  };

  const feedbackPreview = feedbacks.slice(0, 1);

  return (
    <div className="card bg-base-100 border border-base-300 shadow-md">
      <div className="card-body">
        <h2 className="card-title text-xl mb-2">Feedback de Proyectos</h2>

        {feedbackPreview.map((fb) => (
          <div key={fb.feedback_id} className="mb-4">
            <h3 className="font-bold text-base text-primary">
              {fb.Projects?.project_name || "Proyecto Desconocido"}
            </h3>
            <p className="text-base-content text-sm mt-1">"{fb.desc}"</p>
            <div className="mt-2">{renderStars(fb.score)}</div>
          </div>
        ))}

        {feedbacks.length > 1 && (
          <button
            className="btn btn-sm btn-outline btn-primary mt-4"
            onClick={() => setModalOpen(true)}
          >
            Ver más feedback
          </button>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Todos los Feedbacks</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setModalOpen(false)}>
                <IoMdClose className="text-lg" />
              </button>
            </div>

            {feedbacks.map((fb) => (
              <div key={fb.feedback_id} className="mb-6 border-b border-base-300 pb-4">
                <h3 className="font-semibold text-primary">
                  {fb.Projects?.project_name || "Proyecto Desconocido"}
                </h3>
                <p className="text-base-content mt-1">"{fb.desc}"</p>
                <div className="mt-2">{renderStars(fb.score)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WidgetFeedbackColegas;