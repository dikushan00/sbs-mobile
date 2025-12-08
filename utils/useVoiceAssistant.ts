import { useCallback, useEffect, useRef, useState } from "react";
import { Buffer } from "buffer";
import AudioRecord from "react-native-audio-record";
import * as FileSystem from "expo-file-system";

interface VoiceAssistantConfig {
  apiKey: string;
  wsUrl?: string;
  sessionId?: string;
  contractorId?: string;
  contractorName?: string;
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
  const fileUri = `${FileSystem.documentDirectory}${fileName}`;
  
  await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
    encoding: FileSystem.EncodingType.Base64,
  });
  
  return fileUri;
};

export const useVoiceAssistant = ({
  apiKey,
  wsUrl = "wss://apigw.test.bi.group/ai-ofc-sbs-vac",
  sessionId = `rn-session-${Date.now()}`,
  contractorId,
  contractorName,
}: VoiceAssistantConfig) => {
  const wsRef = useRef<WebSocket | null>(null);
  const recordingRef = useRef<any | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<ServerMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // CONNECT to VAC backend
  // ============================================================
  const connect = useCallback(async () => {
    try {
      setError(null);

      let url = `${wsUrl}/ws/${sessionId}?api_key=${apiKey}`;
      if (contractorId) url += `&contractor_id=${contractorId}`;
      if (contractorName) url += `&contractor_name=${encodeURIComponent(contractorName)}`;

      const ws = new WebSocket(url);
      ws.binaryType = "arraybuffer";
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[VAC] Connected");
        setIsConnected(true);
      };

      ws.onmessage = async (event) => {
        
        try {
          if (typeof event.data === "string") {
            const msg = JSON.parse(event.data);
            console.log(msg);
            console.log('[VAC] msg.type', msg.type)
            
            // Skip empty audio buffer errors
            if(msg.error?.code === 'input_audio_buffer_commit_empty') {
              return;
            }
            
            // Log non-audio messages
            if(msg.type !== 'audio') {
              console.log("[VAC] message", msg);
            }
            
            console.log("[VAC] msg", msg.type, !!msg?.audio);
            // Handle audio messages from assistant
            if (msg.type === 'audio') {
              console.log("[VAC] Audio message received", msg.audio);
              try {
                // Save base64 audio to file
                const audioUri = await saveAudioToFile(msg.audio);
                msg.audioUri = audioUri;
                console.log("[VAC] Audio saved to:", audioUri);
              } catch (err) {
                console.error("[VAC] Failed to save audio:", err);
              }
            }
            
            console.log("[VAC] msg", msg);
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
  }, [apiKey, wsUrl, sessionId, contractorName, contractorId]);

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
      
      console.log("[VAC] Disconnected");
    } catch (err) {
      console.error("[VAC] disconnect error", err);
    }
  }, [isRecording]);

  // ============================================================
  // SEND TEXT MESSAGE
  // ============================================================
  const sendTextMessage = useCallback((text: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError("WebSocket not connected");
      return;
    }
    wsRef.current.send(JSON.stringify({ type: "text_message", text }));
  }, []);

  // ============================================================
  // SEND CONTROL MESSAGE
  // ============================================================
  const sendMessage = useCallback((message: any) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError("WebSocket not connected");
      return;
    }
    wsRef.current.send(JSON.stringify(message));
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
    clearMessages: () => setMessages([]),
  };
};
