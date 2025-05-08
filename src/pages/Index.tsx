
import React, { useRef } from "react";
import { ChatProvider, useChatContext } from "@/context/ChatContext";
import ChatContainer from "@/components/ChatContainer";
import ChatInput from "@/components/ChatInput";
import ChatHeader from "@/components/ChatHeader";
import VoiceActivationButton from "@/components/VoiceActivationButton";
import useVoiceInput from "@/hooks/useVoiceInput";
import { generateResponse } from "@/utils/healthResponses";

const ChatPage: React.FC = () => {
  const { addMessage, currentView } = useChatContext();
  const prevViewRef = useRef<string>(currentView);
  
  const { voiceState, startRecording, stopRecording } = useVoiceInput({
    onTranscriptComplete: (transcript) => {
      // Add user message
      addMessage("user", transcript);
      
      // Generate response
      setTimeout(() => {
        const response = generateResponse(transcript, currentView);
        addMessage("assistant", response);
      }, 500);
    }
  });

  return (
    <div className="flex flex-col h-screen bg-background">
      <ChatHeader />
      <ChatContainer />
      <ChatInput />
      <VoiceActivationButton 
        onClick={voiceState.isRecording ? stopRecording : startRecording}
        isRecording={voiceState.isRecording}
      />
    </div>
  );
};

const Index = () => {
  return (
    <ChatProvider>
      <ChatPage />
    </ChatProvider>
  );
};

export default Index;
