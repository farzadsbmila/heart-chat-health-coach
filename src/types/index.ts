
export type ChatView = "general" | "risk" | "recommendations" | "coaching";

export interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
  view?: ChatView;
}

export interface VoiceState {
  isRecording: boolean;
  transcript: string;
  isProcessing: boolean;
}
