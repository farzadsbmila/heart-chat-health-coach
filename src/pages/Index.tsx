import React, { useEffect, useRef } from "react";
import { ChatProvider, useChatContext } from "@/context/ChatContext";
import ChatContainer from "@/components/ChatContainer";
import ChatInput from "@/components/ChatInput";
import VoiceActivationButton from "@/components/VoiceActivationButton";
import useVoiceInput from "@/hooks/useVoiceInput";
import { generateResponse } from "@/utils/healthResponses";
import BottomNav from "@/components/BottomNav";
import HomeButton from "@/components/HomeButton";

const ChatPage: React.FC = () => {
  const { addMessage, currentView, messages } = useChatContext();
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

  // Handle tab/view change - but don't add a message automatically
  // We're removing the automatic message when changing views
  useEffect(() => {
    if (prevViewRef.current !== currentView) {
      // Update the ref to the current view without adding a message
      prevViewRef.current = currentView;
    }
  }, [currentView]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 pb-16">
      <HomeButton />
      <ChatContainer />
      <ChatInput />
      <VoiceActivationButton 
        onClick={voiceState.isRecording ? stopRecording : startRecording}
        isRecording={voiceState.isRecording}
      />
      <BottomNav />
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
