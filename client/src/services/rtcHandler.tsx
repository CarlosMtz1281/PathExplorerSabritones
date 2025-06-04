'use client'

import toast from 'react-hot-toast';
import { Socket } from 'socket.io-client';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5002';

type PeerConnections = {
  [key: string]: RTCPeerConnection;
};

type SetPeersType = React.Dispatch<React.SetStateAction<{ [key: string]: { stream: MediaStream | null } }>>;

class RTCHandler {
  meeting_id: string;
  username: string;
  socket: Socket;
  localStream: MediaStream | null;
  peerConnections: PeerConnections;
  setPeers: SetPeersType;
  mediaEnabled: { video: boolean; audio: boolean };
  hasMediaDevices: boolean;
  onError: (error: Error | string) => void;

  constructor(
    meeting_id: string,
    username: string,
    socket: Socket,
    setPeers: SetPeersType,
    onError: (error: Error | string) => void
  ) {
    this.meeting_id = meeting_id;
    this.username = username;
    this.socket = socket;
    this.localStream = null;
    this.peerConnections = {};
    this.setPeers = setPeers;
    this.mediaEnabled = { video: true, audio: true };
    this.hasMediaDevices = false;
    this.onError = onError;
  }

  async initialize() {
    await this.initializeLocalStream();
    this.setupSocketListeners();
    try {
        console.log(`Attempting to join meeting ${this.meeting_id} as ${this.username}`);
        const response = await fetch(`${apiUrl}/api/users/${this.meeting_id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch users. Please try again.');
        }
        const users = await response.json();
        console.log(`Fetched users: `, users);
        this.handleUsers(users);
    } catch (error) {
        this.onError(error as Error);
    }
}

  async initializeLocalStream() {
    try {
    //   this.localStream = await navigator.mediaDevices.getUserMedia({
    //     video: {
    //       width: { ideal: 320 }, // Lower resolution width
    //       height: { ideal: 240 }, // Lower resolution height
    //       frameRate: { ideal: 10, max: 15 } // Lower frame rate
    //     },
    //     audio: true
    //   });

      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      this.hasMediaDevices = true;

      // Log out details of the localStream
      console.log("Local Stream:", this.localStream);
      this.localStream.getTracks().forEach(track => {
        console.log(`Track kind: ${track.kind}, Track ID: ${track.id}, Track enabled: ${track.enabled}`);
      });

      // Set video encoding parameters if peer connection is available
      if (this.peerConnections) {
        const videoSender = this.peerConnections[Object.keys(this.peerConnections)[0]]?.getSenders().find(sender => sender.track?.kind === 'video');
        if (videoSender) {
          const parameters = videoSender.getParameters();
          if (!parameters.encodings) {
            parameters.encodings = [{}];
          }

          // Set encoding parameters
          parameters.encodings[0].maxBitrate = 250000; // Set max bitrate to 250 kbps
          parameters.encodings[0].maxFramerate = 10; // Limit frame rate to 10 fps
          await videoSender.setParameters(parameters);

          console.log('Video encoding parameters set:', parameters);
        }
      }

    } catch (err) {
      console.warn('No media devices found or access denied:', err);
      toast.error('No media devices found or access denied. Continuing without video/audio.');
      // Create an empty MediaStream to avoid issues with peer connections
      this.localStream = new MediaStream();
      this.hasMediaDevices = false;
    }
  }

  setupSocketListeners() {
    this.socket.on('user_joined', (data) => {
        console.log('User joined:', data);
        this.handleUserJoined(data);
    });

    this.socket.on('error', (error) => {
        console.error('Error from server:', error.message);
        toast.error(error.message);
    });

    this.socket.on('user_left', this.handleUserLeft.bind(this));
    this.socket.on('offer', this.handleOffer.bind(this));
    this.socket.on('answer', this.handleAnswer.bind(this));
    this.socket.on('ice_candidate', this.handleNewICECandidateMsg.bind(this));
  }



  createPeerConnection = (peerUsername: string): RTCPeerConnection | null => {
    if (!this.localStream) {
      console.error('Local stream not available');
      return null;
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.relay.metered.ca:80" },
        {
          urls: "turn:turn.relay.metered.ca:80",
          username: "your-username", // Add valid username here
          credential: "your-credential" // Add valid credential here
        },
        {
          urls: "turn:turn.relay.metered.ca:443",
          username: "your-username", // Add valid username here
          credential: "your-credential" // Add valid credential here
        },
        {
          urls: "turns:turn.relay.metered.ca:443",
          username: "your-username", // Add valid username here
          credential: "your-credential" // Add valid credential here
        }
      ]
    });

    pc.onicecandidate = (event) => this.handleICECandidateEvent(event, peerUsername);
    pc.ontrack = (event) => this.handleTrackEvent(event, peerUsername);

    this.localStream.getTracks().forEach(track => {
      pc.addTrack(track, this.localStream!);
    });

    this.peerConnections[peerUsername] = pc;

    return pc;
  }

  handleUserJoined = ({ username: peerUsername, users }: { username: string; users: string[] }) => {
    console.log(`${peerUsername} joined the room. Current users:`, users);
    this.updatePeers({ [peerUsername]: { stream: null } });
  }

  handleUserLeft = ({ username: peerUsername }: { username: string }) => {
    console.log(`${peerUsername} left the room`);
    if (this.peerConnections[peerUsername]) {
      this.peerConnections[peerUsername].close();
      delete this.peerConnections[peerUsername];
    }
    this.setPeers(prevPeers => {
      const newPeers = { ...prevPeers };
      delete newPeers[peerUsername];
      return newPeers;
    });
  }

  handleOffer = async ({ offer, from: peerUsername }: { offer: RTCSessionDescriptionInit; from: string }) => {
    console.log(`Received offer from ${peerUsername}`);
    const pc = this.peerConnections[peerUsername] || this.createPeerConnection(peerUsername);
    if (pc) {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        this.socket.emit('answer', {
          meeting_id: this.meeting_id,
          answer: pc.localDescription,
          from: this.username,
          to: peerUsername
        });
      } catch (err) {
        console.error('Error handling offer:', err);
      }
    }
  }

  handleAnswer = async ({ answer, from: peerUsername }: { answer: RTCSessionDescriptionInit; from: string }) => {
    console.log(`Received answer from ${peerUsername}`);
    const pc = this.peerConnections[peerUsername];
    if (pc) {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (err) {
        console.error('Error handling answer:', err);
      }
    }
  }

  handleICECandidateEvent = (event: RTCPeerConnectionIceEvent, peerUsername: string) => {
    if (event.candidate) {
      console.log(`Sending ICE candidate to ${peerUsername}`);
      this.socket.emit('ice_candidate', {
        meeting_id: this.meeting_id,
        candidate: event.candidate,
        from: this.username,
        to: peerUsername
      });
    }
  }

  handleNewICECandidateMsg = async ({ candidate, from: peerUsername }: { candidate: RTCIceCandidateInit; from: string }) => {
    console.log(`Received ICE candidate from ${peerUsername}`);
    const pc = this.peerConnections[peerUsername];
    if (pc) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
      }
    }
  }

  handleTrackEvent = (event: RTCTrackEvent, peerUsername: string) => {
    console.log(`Received tracks from ${peerUsername}:`, event.streams);
    this.updatePeers({ [peerUsername]: { stream: event.streams[0] } });
  }

  handleUsers = (users: string[]) => {
    console.log('Received users list:', users);
    users.forEach(user => {
      if (user !== this.username && !this.peerConnections[user]) {
        console.log(`Creating peer connection for ${user}`);
        const pc = this.createPeerConnection(user);
        if (pc) {
          pc.createOffer()
            .then(offer => pc.setLocalDescription(offer))
            .then(() => {
              this.socket.emit('offer', {
                meeting_id: this.meeting_id,
                offer: pc.localDescription,
                from: this.username,
                to: user
              });
            })
            .catch(err => console.error('Error creating offer:', err));
        }
      }
    });
  }

  updatePeers = (update: { [key: string]: { stream: MediaStream | null } }) => {
    if (this.setPeers) {
      this.setPeers(prevPeers => ({ ...prevPeers, ...update }));
    }
  }

  toggleMedia(trackType: 'video' | 'audio', enabled: boolean) {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        if (track.kind === trackType) {
          track.enabled = enabled;
          this.mediaEnabled[trackType] = enabled;
        }
      });
    }
  }

  toggleVideo(enabled: boolean) {
    this.toggleMedia('video', enabled);
  }

  toggleAudio(enabled: boolean) {
    this.toggleMedia('audio', enabled);
  }

  cleanup() {
    this.localStream?.getTracks().forEach(track => track.stop());
    Object.values(this.peerConnections).forEach(pc => pc.close());
  }
}

export default RTCHandler;
