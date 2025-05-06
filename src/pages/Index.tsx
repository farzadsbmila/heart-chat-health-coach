
import React, { useEffect, useRef } from "react";
import { ChatProvider, useChatContext } from "@/context/ChatContext";
import ChatContainer from "@/components/ChatContainer";
import ChatInput from "@/components/ChatInput";
import ChatHeader from "@/components/ChatHeader";
import VoiceActivationButton from "@/components/VoiceActivationButton";
import useVoiceInput from "@/hooks/useVoiceInput";
import { generateResponse } from "@/utils/healthResponses";

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

  // Handle tab/view change message - only once when view changes
  useEffect(() => {
    if (prevViewRef.current !== currentView) {
      const viewMessages = {
        risk: "I'm now focusing on your cardiovascular risk assessment. What would you like to know about your risk factors?",
        recommendations: "Let's talk about heart health recommendations. I can provide guidance on diet, exercise, or medication adherence.",
        coaching: "I'm here as your health coach. How can I help you implement heart-healthy changes in your daily life?",
        general: "I'm your heart health assistant. How can I help you today?"
      };
      
      // Only add the message when changing to a specific view from another view
      if (currentView !== "general") {
        addMessage("assistant", viewMessages[currentView]);
      }
      
      // Update the ref to the current view
      prevViewRef.current = currentView;
    }
  }, [currentView, addMessage]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
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
