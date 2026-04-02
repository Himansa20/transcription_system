import React, { useRef, useState, useCallback } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import MainContent from "./components/MainContent/MainContent";
import RightPanel from "./components/RightPanel/RightPanel";

const CHUNK_INTERVAL_MS = 5000;

function App() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("idle");

  const mediaRecorderRef = useRef(null);
  const socketRef = useRef(null);
  const streamRef = useRef(null);
  const restartTimerRef = useRef(null);
  const isRecordingRef = useRef(false);

  const createAndStartRecorder = useCallback((stream, ws) => {
    if (!isRecordingRef.current || ws.readyState !== WebSocket.OPEN) return;

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "audio/webm;codecs=opus",
    });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
        ws.send(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      if (isRecordingRef.current && ws.readyState === WebSocket.OPEN) {
        createAndStartRecorder(stream, ws);
      }
    };

    mediaRecorder.start();

    restartTimerRef.current = setTimeout(() => {
      if (mediaRecorder.state === "recording") {
        mediaRecorder.stop();
      }
    }, CHUNK_INTERVAL_MS);
  }, []);

  const startRecording = useCallback(async () => {
    const patientId = selectedPatient?.id;
    if (!patientId) {
      alert("Please select a patient first.");
      return;
    }

    setStatus("connecting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const ws = new WebSocket(
        `ws://localhost:8000/ws/transcribe/${patientId.trim()}`
      );
      socketRef.current = ws;

      ws.onopen = () => {
        setStatus("connected");
        isRecordingRef.current = true;
        setRecording(true);
        createAndStartRecorder(stream, ws);
      };

      ws.onmessage = (event) => {
        const text = event.data;
        if (text && text !== "[transcription error]") {
          setTranscript((prev) => (prev ? prev + " " + text : text));
        }
      };

      ws.onerror = () => {
        setStatus("error");
      };

      ws.onclose = () => {
        setStatus("closed");
        isRecordingRef.current = false;
        setRecording(false);
      };
    } catch (err) {
      console.error("Microphone access denied:", err);
      setStatus("error");
      alert("Could not access microphone. Please allow microphone permissions.");
    }
  }, [selectedPatient, createAndStartRecorder]);

  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;

    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setRecording(false);
    setStatus("idle");
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          selectedPatientId={selectedPatient?.id}
          onSelectPatient={setSelectedPatient}
        />
        <MainContent transcript={transcript} recording={recording} />
        <RightPanel
          recording={recording}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          status={status}
        />
      </div>
    </div>
  );
}

export default App;
