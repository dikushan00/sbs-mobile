import { useCallback, useRef, useState } from "react";
import { Buffer } from "buffer";
import AudioRecord from "react-native-audio-record";
import { PermissionsAndroid, Platform } from "react-native";
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
// Audio helpers
// ============================================================
const DEFAULT_SAMPLE_RATE = 24000;
const DEFAULT_CHANNELS = 1;
const DEFAULT_BITS_PER_SAMPLE = 16;

const isWavBuffer = (buf: Buffer) => {
  if (buf.length < 12) return false;
  return (
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WAVE"
  );
};

const createWavFromPcm16 = (
  pcmData: Buffer,
  sampleRate = DEFAULT_SAMPLE_RATE,
  channels = DEFAULT_CHANNELS,
  bitsPerSample = DEFAULT_BITS_PER_SAMPLE
) => {
  const byteRate = (sampleRate * channels * bitsPerSample) / 8;
  const blockAlign = (channels * bitsPerSample) / 8;
  const dataSize = pcmData.length;
  const chunkSize = 36 + dataSize;

  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(chunkSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // PCM header size
  header.writeUInt16LE(1, 20); // PCM format
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmData]);
};

const saveAudioToFile = async (audioBuf: Buffer): Promise<string> => {
  const timestamp = Date.now();
  const fileName = `vac_audio_${timestamp}.wav`;
  const fileUri = `${FileSystem.Paths.document.uri}${fileName}`;

  const base64Audio = audioBuf.toString("base64");
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
  const audioDataListenerAttachedRef = useRef(false);
  
  // Audio buffer for collecting chunks
  const audioBufferRef = useRef<Buffer[]>([]);

  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<ServerMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const ensureMicrophonePermission = useCallback(async () => {
    if (Platform.OS !== "android") return true;

    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
    );
    if (hasPermission) return true;

    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: "Доступ к микрофону",
        message: "Нужен доступ к микрофону для голосового ввода.",
        buttonPositive: "Разрешить",
        buttonNegative: "Отмена",
      }
    );

    return result === PermissionsAndroid.RESULTS.GRANTED;
  }, []);

  // ============================================================
  // Helper: Process buffered audio chunks
  // ============================================================
  const processAudioBuffer = useCallback(async () => {
    if (audioBufferRef.current.length === 0) return;
    
    console.log(`[VAC] Processing ${audioBufferRef.current.length} audio chunks (bytes)`);
    
    try {
      const combined = Buffer.concat(audioBufferRef.current);
      const wavBuf = isWavBuffer(combined)
        ? combined
        : createWavFromPcm16(combined, DEFAULT_SAMPLE_RATE, DEFAULT_CHANNELS, DEFAULT_BITS_PER_SAMPLE);

      // Save to file
      const audioUri = await saveAudioToFile(wavBuf);
      
      // Create a single message with combined audio
      const audioMessage: ServerMessage = {
        type: 'audio',
        role: 'assistant',
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
            
            // Skip empty audio buffer errors
            if(msg.error?.code === 'input_audio_buffer_commit_empty') {
              return;
            }
            
            // Handle audio chunks - buffer them instead of immediate save
            if (msg.type === 'audio' && msg.audio) {
              console.log(`[VAC] Audio chunk received (${msg.audio.length} chars base64)`);
              
              // Add chunk to buffer
              audioBufferRef.current.push(Buffer.from(msg.audio, "base64"));
              
              // Don't add individual chunks to messages
              return;
            }
            
            // For non-audio messages, if there's buffered audio, process it first
            if (audioBufferRef.current.length > 0) {
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
    try {
      setError(null);

      const granted = await ensureMicrophonePermission();
      if (!granted) {
        setError("Нет доступа к микрофону (RECORD_AUDIO).");
        return;
      }

      AudioRecord.init({
        sampleRate: 24000,
        channels: 1,
        bitsPerSample: 16,
        wavFile: "audio_mateirals.wav",
        audioSource: 6, // voice recognition
      });

      if (!audioDataListenerAttachedRef.current) {
        AudioRecord.on("data", (base64PCM) => {
          if (wsRef.current?.readyState !== WebSocket.OPEN) return;

          const rawBytes = Buffer.from(base64PCM, "base64");
          wsRef.current.send(rawBytes);
        });
        audioDataListenerAttachedRef.current = true;
      }

      await AudioRecord.start();
      console.log("[VAC] startRecording");
      wsRef.current?.send(JSON.stringify({ type: "audio_start" }));

      setIsRecording(true);
    } catch (err) {
      console.error("[VAC] startRecording error", err);
      setIsRecording(false);
      setError("Не удалось начать запись аудио. Проверьте разрешение микрофона и настройки эмулятора.");
    }
  }, [ensureMicrophonePermission]);
  
  const stopRecording = useCallback(async () => {
    try {
      await AudioRecord.stop();
      wsRef.current?.send(JSON.stringify({ type: "audio_end" }));
      setIsRecording(false);
      console.log("[VAC] stopRecording");
    } catch (err) {
      console.error("[VAC] stopRecording error", err);
      setIsRecording(false);
    }
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
