import React, { useRef, useState, useCallback } from "react";

const CHUNK_INTERVAL_MS = 5000; // Stop & restart recorder every 3 seconds

function Recorder({ patientId, patientName }) {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("idle"); // idle | connecting | connected | error | closed
  const mediaRecorderRef = useRef(null);
  const socketRef = useRef(null);
  const streamRef = useRef(null);
  const restartTimerRef = useRef(null);
  const isRecordingRef = useRef(false); // tracks intent to record (survives async gaps)

  /**
   * Create a fresh MediaRecorder on the given stream, wire it up to send
   * its complete blob over the WebSocket when it stops, then start it.
   * After CHUNK_INTERVAL_MS we stop it (which fires ondataavailable +
   * onstop) and immediately create a new one — giving each blob a valid
   * WebM header so ffmpeg can decode it.
   */
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
      // When this recorder stops, start a new one (if still recording)
      if (isRecordingRef.current && ws.readyState === WebSocket.OPEN) {
        createAndStartRecorder(stream, ws);
      }
    };

    // Start recording (no timeslice — we'll stop it manually)
    mediaRecorder.start();

    // Schedule a stop after CHUNK_INTERVAL_MS
    restartTimerRef.current = setTimeout(() => {
      if (mediaRecorder.state === "recording") {
        mediaRecorder.stop(); // triggers ondataavailable then onstop
      }
    }, CHUNK_INTERVAL_MS);
  }, []);

  const startRecording = useCallback(async () => {
    if (!patientId || !patientId.trim()) {
      alert("Please enter a Patient ID first.");
      return;
    }

    setStatus("connecting");

    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // Create WebSocket
      const ws = new WebSocket(
        `ws://localhost:8000/ws/transcribe/${patientId.trim()}`,
      );
      socketRef.current = ws;

      ws.onopen = () => {
        console.log("✅ WebSocket connected");
        setStatus("connected");
        isRecordingRef.current = true;
        setRecording(true);

        // Kick off the stop-and-restart cycle
        createAndStartRecorder(stream, ws);
      };

      ws.onmessage = (event) => {
        const text = event.data;
        if (text && text !== "[transcription error]") {
          setTranscript((prev) => (prev ? prev + " " + text : text));
        }
      };

      ws.onerror = (err) => {
        console.error("❌ WebSocket error:", err);
        setStatus("error");
      };

      ws.onclose = (event) => {
        console.log("🔌 WebSocket closed:", event.code, event.reason);
        setStatus("closed");
        isRecordingRef.current = false;
        setRecording(false);
      };
    } catch (err) {
      console.error("🎤 Microphone access denied:", err);
      setStatus("error");
      alert(
        "Could not access microphone. Please allow microphone permissions.",
      );
    }
  }, [patientId, createAndStartRecorder]);

  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;

    // Cancel pending restart timer
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    // Stop MediaRecorder
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    // Close WebSocket
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close();
    }

    // Release microphone
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setRecording(false);
    setStatus("idle");
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  const getStatusBadge = () => {
    const badges = {
      idle: { text: "Ready", className: "status-idle" },
      connecting: { text: "Connecting...", className: "status-connecting" },
      connected: { text: "● Recording", className: "status-connected" },
      error: { text: "Error", className: "status-error" },
      closed: { text: "Disconnected", className: "status-closed" },
    };
    const badge = badges[status] || badges.idle;
    return (
      <span className={`status-badge ${badge.className}`}>{badge.text}</span>
    );
  };

  return (
    <div className="recorder-container">
      <div className="recorder-header">
        <div>
          <h2>{patientName || "Unknown Patient"}</h2>
          <span className="patient-id-label">{patientId}</span>
        </div>
        {getStatusBadge()}
      </div>

      <div className="recorder-controls">
        {!recording ? (
          <button
            className="btn btn-start"
            onClick={startRecording}
            disabled={status === "connecting"}
          >
            {status === "connecting" ? "Connecting..." : "🎙️ Start Recording"}
          </button>
        ) : (
          <button className="btn btn-stop" onClick={stopRecording}>
            ⏹️ Stop Recording
          </button>
        )}

        {transcript && (
          <button className="btn btn-clear" onClick={clearTranscript}>
            🗑️ Clear
          </button>
        )}
      </div>

      <div className="transcript-section">
        <h3>Live Transcript</h3>
        <div className="transcript-box">
          {transcript ? (
            <p>{transcript}</p>
          ) : (
            <p className="transcript-placeholder">
              {recording
                ? "Listening... speak now"
                : "Start recording to see live transcription"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Recorder;
