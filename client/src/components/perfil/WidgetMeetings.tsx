'use client';

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Meeting {
  meeting_id: number;
  meeting_date: string;
  meeting_link: string;
  participant: {
    id: number;
    name: string;
    email: string;
  };
  project: {
    id: number;
    name: string;
    company: string;
  };
  position: {
    id: number;
    name: string;
    capability: string;
  };
  postulation_date: string;
}

const WidgetMeetings = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE}/project/getMeetings`,
          {
            headers: { "session-key": session?.sessionId },
          }
        );
        setMeetings(response.data);
      } catch (error) {
        console.error("Error fetching meetings:", error);
      }
    };


    fetchMeetings();
  }, []);


  return (
    <div className="card bg-base-100 shadow-lg p-6 rounded-lg w-full">
      {/* Header */}
      <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-10 w-10" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zm10-10h.01M12 12h.01M9 12h.01" 
            />
          </svg>
        Juntas
      </h2>

      {/* Meetings List */}
      <div className="overflow-y-auto max-h-[300px]">
        <div className="space-y-2">
          {meetings.map((meeting: Meeting) => (
            <div
              key={meeting.meeting_id}
              className="card bg-base-200 shadow-sm p-3 rounded-lg"
            >
              <h3 className="text-md font-semibold line-clamp-1">
                {meeting.project.name}
              </h3>
              <p className="text-sm text-secondary line-clamp-1">
                {meeting.position.name}
              </p>
              <p className="text-xs text-gray-600 line-clamp-1 mt-1">
                <span className="font-medium">Fecha:</span> {new Date(meeting.meeting_date).toLocaleDateString()} - {new Date(meeting.meeting_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <a
                href={`/meet/${meeting.meeting_link}?username=${session?.user?.name}&record=false`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-primary mt-2 inline-block text-base font-semibold pt-0.5"
              >
                Unirse a la reunión
              </a>
            </div>
          ))}
        </div>
      </div>
      {meetings.length === 0 && (
        <div className="text-center text-gray-500 mt-4">
          No tienes reuniones programadas.
        </div>
      )}
    </div>
  );
};

export default WidgetMeetings;