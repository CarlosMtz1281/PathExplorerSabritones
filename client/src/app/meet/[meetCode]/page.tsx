'use client'

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import RTCHandler from '../../../services/rtcHandler';
import toast, { Toaster } from 'react-hot-toast';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhone, FaDotCircle, FaStopCircle } from 'react-icons/fa';

const apiUrl = process.env.NEXT_PUBLIC_FLASK_WEB_API_URL || 'http://localhost:5002';

const MeetingPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [showRecordButton, setShowRecordButton] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const rtcHandler = useRef<RTCHandler | null>(null);
  const [peers, setPeers] = useState<{ [key: string]: { stream: MediaStream } }>({});
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Recording state
  const [recording, setRecording] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);

  const errorHandler = (error: Error) => {
    console.error('Error occurred:', error);
    router.push('/dashboard');
    toast.error(error.message);
  };

  useEffect(() => {
    const meeting_id = params.meetCode as string;
    const query = new URLSearchParams(window.location.search);
    const username = query.get('username');
    const record = query.get('record');

    if (meeting_id && username) {
      setMeetingId(meeting_id);
      setUsername(username);
    }
    if (record === 'true') {
      setShowRecordButton(true);
    }
  }, [params, searchParams]);

  const initializeMeeting = async () => {
    if (!username || !meetingId) {
      toast.error('Please enter a username and valid meeting ID before joining a meeting.');
      router.push('/dashboard');
      return;
    }

    const newSocket = io(apiUrl);
    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      newSocket.emit('join', { meeting_id: meetingId, username });
    });

    newSocket.on('user_joined', (data) => {
      console.log('User joined:', data.username);
      toast(`${data.username} joined the meeting`);
    });

    newSocket.on('error', (error) => {
      toast.error(error.message);
    });

    rtcHandler.current = new RTCHandler(meetingId, username, newSocket, setPeers, errorHandler);
    rtcHandler.current.initialize();
  };

  useEffect(() => {
    if (meetingId && username) {
      initializeMeeting();
      setInitialized(true);
    }

    return () => {
      if (rtcHandler.current) {
        rtcHandler.current.cleanup();
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      stopRecording(); // Clean up recording on unmount
    };
  }, [meetingId, username]);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const newState = !prev;
      if (rtcHandler.current?.localStream) {
        rtcHandler.current.localStream.getAudioTracks().forEach(track => {
          track.enabled = !newState;
        });
      }
      return newState;
    });
  };

  const toggleVideo = () => {
    setIsVideoOff((prev) => {
      const newState = !prev;
      if (rtcHandler.current?.localStream) {
        rtcHandler.current.localStream.getVideoTracks().forEach(track => {
          track.enabled = !newState;
        });
      }
      return newState;
    });
  };

  const leaveMeeting = () => {
    stopRecording(); // Stop recording if leaving
    router.push('/dashboard');
  };

  const drawStreamsOnCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const streams = [
      { stream: rtcHandler.current!.localStream, peerName: 'You' },
      ...Object.entries(peers).map(([peerUsername, peer]) => ({
        stream: peer.stream,
        peerName: peerUsername,
      })),
    ];

    const videoWidth = canvas.width / streams.length;
    const videoHeight = canvas.height;

    streams.forEach((streamObj, index) => {
      const videoElement = document.createElement('video');
      videoElement.srcObject = streamObj.stream;
      videoElement.muted = true;
      videoElement.autoplay = true;
      videoElement.playsInline = true;

      videoElement.onloadedmetadata = () => {
        videoElement.play();
        const drawFrame = () => {
          if (!videoElement.paused && !videoElement.ended) {
            ctx.clearRect(index * videoWidth, 0, videoWidth, videoHeight);
            ctx.drawImage(videoElement, index * videoWidth, 0, videoWidth, videoHeight);
            requestAnimationFrame(drawFrame);
          }
        };
        drawFrame();
      };
    });
  };

  const startRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    drawStreamsOnCanvas();
  
    // Capture video stream from canvas
    const canvasStream = canvas.captureStream();
    // Capture audio stream from the local stream
    const audioStream = rtcHandler.current!.localStream;
  
    // Combine both video and audio streams
    const combinedStream = new MediaStream([...canvasStream.getTracks(), ...audioStream.getAudioTracks()]);
  
    mediaRecorder.current = new MediaRecorder(combinedStream);
    mediaRecorder.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.current.push(event.data);
      }
    };
  
    mediaRecorder.current.onstop = async () => {
      const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
      const formData = new FormData();
      formData.append('video', blob, 'meeting_recording.webm');
      formData.append('meeting_id', meetingId as string);
  
      try {
        const response = await fetch(`${apiUrl}/api/upload-video`, {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          throw new Error('Failed to upload video. Please try again.');
        }
        toast.success('Video recording uploaded successfully!');
      } catch (error) {
        console.error('Error uploading video:', error);
        toast.error((error as Error).message);
      }
    };
  
    mediaRecorder.current.start();
    setRecording(true);
    toast.success('Recording started');
  };
  
  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setRecording(false);
      recordedChunks.current = [];
      toast.success('Recording stopped and uploading...');
    }
  };

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-700">Joining meeting...</p>
        </div>
      </div>
    );
  }

  const VideoElement: React.FC<{ 
    stream: MediaStream; 
    muted: boolean; 
    peerName: string; 
    isVideoOff: boolean;
  }> = ({ stream, muted, peerName, isVideoOff }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
      }
    }, [stream]);

    return (
      <div className="relative w-full aspect-video bg-base-300 rounded-lg overflow-hidden">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted={muted} 
          className={`w-full h-full object-cover ${isVideoOff ? 'opacity-50' : ''}`} 
        />
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <p className="text-white text-sm font-medium">
            {peerName} {isVideoOff && '(Video Off)'}
          </p>
        </div>
        
        {isVideoOff && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-secondary rounded-full h-20 w-20 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {peerName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const participants = [
    {
      id: 'local',
      stream: rtcHandler.current?.localStream,
      peerName: username || 'You',
      isLocal: true
    },
    ...Object.entries(peers).map(([peerUsername, peer]) => ({
      id: peerUsername,
      stream: peer.stream,
      peerName: peerUsername,
      isLocal: false
    }))
  ].filter(p => p.stream);

  const activeParticipants = participants.filter(p => p.stream);

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <Toaster position="top-center" reverseOrder={false} />
      
      <main className="flex-grow p-4">
        <div className={`grid gap-4 ${activeParticipants.length === 1 ? 'grid-cols-1 max-w-4xl mx-auto' : 'grid-cols-1 md:grid-cols-2'}`}>
          {participants.map(participant => (
            <VideoElement
              key={participant.id}
              stream={participant.stream}
              muted={participant.isLocal}
              peerName={participant.peerName}
              isVideoOff={participant.isLocal ? isVideoOff : false}
            />
          ))}
        </div>
      </main>

      <footer className="bg-secondary p-4">
        <div className="flex justify-center space-x-6">
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full ${isMuted ? 'bg-red-500 text-white' : 'bg-gray-800 text-white'}`}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <FaMicrophoneSlash className="h-5 w-5" /> : <FaMicrophone className="h-5 w-5" />}
          </button>
          
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full ${isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-800 text-white'}`}
            aria-label={isVideoOff ? "Turn on video" : "Turn off video"}
          >
            {isVideoOff ? <FaVideoSlash className="h-5 w-5" /> : <FaVideo className="h-5 w-5" />}
          </button>

          {showRecordButton && (recording ? (
            <button
              onClick={stopRecording}
              className="p-3 rounded-full bg-red-600 text-white"
              aria-label="Stop recording"
            >
              <FaStopCircle className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="p-3 rounded-full bg-gray-800 text-white"
              aria-label="Start recording"
            >
              <FaDotCircle className="h-5 w-5" />
            </button>
          ))}
          
          <button
            onClick={leaveMeeting}
            className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700"
            aria-label="Leave meeting"
          >
            <FaPhone className="h-5 w-5" />
          </button>
        </div>
      </footer>

      {/* Hidden canvas for recording */}
      <canvas 
        ref={canvasRef} 
        style={{ display: 'none' }} 
        width={1280} 
        height={720} 
      />
    </div>
  );
};

export default MeetingPage;