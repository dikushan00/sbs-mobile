import { useCallback, useEffect, useRef, useState } from "react";
import { Buffer } from "buffer";
import AudioRecord from "react-native-audio-record";
import * as FileSystem from "expo-file-system";
import * as FileSystemLegacy from "expo-file-system/legacy";

interface VoiceAssistantConfig {
  apiKey: string;
  wsUrl?: string;
  sessionId?: string;
  contractorId?: number;
  employeeId?: number;
  projectId?: number;
}

export interface ServerMessage {
  type: string;
  role?: string;
  text?: string;
  data?: any;
  audio?: string; // base64 audio from server
  audioUri?: string; // local file URI after saving
  error?: {
    message: string;
    code?: string;
  };
}

// ============================================================
// Helper: Save base64 audio to file
// ============================================================
const saveAudioToFile = async (base64Audio: string): Promise<string> => {
  const timestamp = Date.now();
  const fileName = `vac_audio_${timestamp}.wav`;
  const fileUri = `${FileSystem.Paths.document.uri}${fileName}`;
  
  await FileSystemLegacy.writeAsStringAsync(fileUri, base64Audio, {
    encoding: FileSystemLegacy.EncodingType.Base64,
  });
  
  return fileUri;
};

export const useVoiceAssistant = ({
  apiKey,
  wsUrl = "wss://apigw.test.bi.group/ai-ofc-sbs-vac",
  sessionId = `rn-session-${Date.now()}`,
  contractorId,
  employeeId,
  projectId,
}: VoiceAssistantConfig) => {
  const wsRef = useRef<WebSocket | null>(null);
  const recordingRef = useRef<any | null>(null);
  
  // Audio buffer for collecting chunks
  const audioBufferRef = useRef<string[]>([]);
  const audioTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<ServerMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // Helper: Process buffered audio chunks
  // ============================================================
  const processAudioBuffer = useCallback(async () => {
    if (audioBufferRef.current.length === 0) return;
    
    console.log(`[VAC] Processing ${audioBufferRef.current.length} audio chunks`);
    
    try {
      // Combine all base64 chunks
      const combinedBase64 = audioBufferRef.current.join('');
      
      // Save combined audio to file
      const audioUri = await saveAudioToFile(combinedBase64);
      
      // Create a single message with combined audio
      const audioMessage: ServerMessage = {
        type: 'audio',
        role: 'assistant',
        audio: combinedBase64,
        audioUri: audioUri,
      };
      
      setMessages((prev) => [...prev, audioMessage]);
      console.log(`[VAC] Combined audio saved to: ${audioUri}`);
      
      // Clear buffer
      audioBufferRef.current = [];
    } catch (err) {
      console.error("[VAC] Failed to process audio buffer:", err);
    }
  }, []);

  // ============================================================
  // CONNECT to VAC backend
  // ============================================================
  const connect = useCallback(async () => {
    try {
      setError(null);

      let url = `${wsUrl}/ws/${sessionId}?api_key=${apiKey}`;
      if (contractorId) url += `&contractor_id=${contractorId}`;
      if (employeeId) url += `&employee_id=${employeeId}`;
      if (projectId) url += `&project_id=${projectId}`;

      const ws = new WebSocket(url);
      ws.binaryType = "arraybuffer";
      wsRef.current = ws;

      console.log("[VAC] Connecting to", url);
      ws.onopen = () => {
        console.log("[VAC] Connected");
        setIsConnected(true);
      };

      ws.onmessage = async (event) => {
        try {
          if (typeof event.data === "string") {
            const msg = JSON.parse(event.data);
            console.log('[VAC] msg.type', msg.type)
            
            // Skip empty audio buffer errors
            if(msg.error?.code === 'input_audio_buffer_commit_empty') {
              return;
            }
            
            // Handle audio chunks - buffer them instead of immediate save
            if (msg.type === 'audio' && msg.audio) {
              console.log(`[VAC] Audio chunk received (${msg.audio.length} chars)`);
              
              // Add chunk to buffer
              audioBufferRef.current.push(msg.audio);
              
              // Reset timer - wait for more chunks
              if (audioTimerRef.current) {
                clearTimeout(audioTimerRef.current);
              }
              
              // Set timer to process buffer after 300ms of no new chunks
              audioTimerRef.current = setTimeout(() => {
                processAudioBuffer();
              }, 300);
              
              // Don't add individual chunks to messages
              return;
            }
            
            // For non-audio messages, if there's buffered audio, process it first
            if (audioBufferRef.current.length > 0) {
              if (audioTimerRef.current) {
                clearTimeout(audioTimerRef.current);
              }
              await processAudioBuffer();
            }
            
            // Handle non-audio messages normally
            setMessages((prev) => [...prev, msg]);
            handleServerMessage(msg);
          }
        } catch (err) {
          console.error("[VAC] parse error", err);
        }
      };

      ws.onerror = () => setError("WebSocket error");
      ws.onclose = () => setIsConnected(false);
    } catch (err) {
      console.error("[VAC] connect error", err);
      setError("Connection failed");
    }
  }, [apiKey, wsUrl, sessionId, contractorId, employeeId, projectId]);

  const startRecording = useCallback(async () => {
    AudioRecord.init({
      sampleRate: 24000,
      channels: 1,
      bitsPerSample: 16,
      wavFile: 'audio_mateirals.wav',
      audioSource: 6, // voice recognition
    });

    AudioRecord.on("data", (base64PCM) => {
      if (wsRef.current?.readyState !== WebSocket.OPEN) return;

      const rawBytes = Buffer.from(base64PCM, "base64");
      wsRef.current.send(rawBytes);
    });

    await AudioRecord.start();
    console.log('[VAC] startRecording');
    wsRef.current?.send(JSON.stringify({ type: "audio_start" }));

    setIsRecording(true);
  }, []);
  
  const stopRecording = useCallback(async () => {
    await AudioRecord.stop();
    wsRef.current?.send(JSON.stringify({ type: "audio_end" }));
    setIsRecording(false);
    console.log('[VAC] stopRecording');
  }, []);

  // ============================================================
  // DISCONNECT from VAC backend
  // ============================================================
  const disconnect = useCallback(async () => {
    try {
      // Process any remaining buffered audio
      if (audioBufferRef.current.length > 0) {
        await processAudioBuffer();
      }
      
      // Clear audio timer
      if (audioTimerRef.current) {
        clearTimeout(audioTimerRef.current);
        audioTimerRef.current = null;
      }
      
      // Stop recording if active
      if (isRecording) {
        await AudioRecord.stop();
        setIsRecording(false);
      }

      // Close WebSocket connection
      if (wsRef.current) {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.close();
        }
        wsRef.current = null;
      }

      // Reset states
      setIsConnected(false);
      setError(null);
      audioBufferRef.current = [];
      
      console.log("[VAC] Disconnected");
    } catch (err) {
      console.error("[VAC] disconnect error", err);
    }
  }, [isRecording, processAudioBuffer]);

  // ============================================================
  // SEND TEXT MESSAGE
  // ============================================================
  const sendTextMessage = useCallback((text: string) => {
    return
  }, []);

  // ============================================================
  // SEND CONTROL MESSAGE
  // ============================================================
  const sendMessage = useCallback((message: any) => {
    return
  }, []);

  // ============================================================
  // HANDLE SERVER EVENTS
  // ============================================================
  const handleServerMessage = (msg: ServerMessage) => {
    switch (msg.type) {
      case "ready":
        console.log("[VAC] ready");
        break;

      case "transcript":
        console.log("[VAC transcript]", msg.role, msg.text);
        break;

      case "material_matched":
        console.log("[VAC matched]", msg.data?.material_name);
        break;

      case "material_confirmed":
        console.log("[VAC confirmed]", msg.data);
        break;

      case "error":
        setError(msg.error?.message || "Server error");
        break;
    }
  };

  // ============================================================
  // CLEAR MESSAGES
  // ============================================================
  const clearMessages = useCallback(() => {
    // Clear any pending audio buffer
    if (audioTimerRef.current) {
      clearTimeout(audioTimerRef.current);
      audioTimerRef.current = null;
    }
    audioBufferRef.current = [];
    setMessages([]);
  }, []);

  return {
    isConnected,
    isRecording,
    messages,
    error,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    sendTextMessage,
    sendMessage,
    clearMessages,
  };
};
