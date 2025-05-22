import React, { useEffect, useRef, useState } from "react";
import { ChatProvider, useChatContext } from "@/context/ChatContext";
import ChatContainer from "@/components/ChatContainer";
import ChatInput from "@/components/ChatInput";
import VoiceActivationButton from "@/components/VoiceActivationButton";
import useVoiceInput from "@/hooks/useVoiceInput";
import { generateResponse } from "@/utils/healthResponses";
import BottomNav from "@/components/BottomNav";
import HomeButton from "@/components/HomeButton";
import { Send, Mic } from "lucide-react";
import ChatMessage from "@/components/ChatMessage";
import { Message } from "@/types";

const ChatPage: React.FC = () => {
  const { addMessage, currentView, messages } = useChatContext();
  const prevViewRef = useRef<string>(currentView);
  const [input, setInput] = useState("");
  const [messagesState, setMessagesState] = useState<Message[]>([]);
  
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

  const handleSendMessage = () => {
    if (input.trim()) {
      setMessagesState([...messagesState, { id: Date.now().toString(), content: input, role: "user", timestamp: new Date() }]);
      setInput("");
    }
  };

  const handleVoiceInput = () => {
    // Implement voice input logic here
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 pb-16">
      <HomeButton />
      <ChatContainer />
      <div className="flex-1 overflow-y-auto p-4">
        {messagesState.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
      </div>
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={handleSendMessage}
            className="rounded-lg bg-blue-500 p-2 text-white hover:bg-blue-600"
          >
            <Send className="h-5 w-5" />
          </button>
          <button
            onClick={handleVoiceInput}
            className="rounded-lg bg-blue-500 p-2 text-white hover:bg-blue-600"
          >
            <Mic className="h-5 w-5" />
          </button>
        </div>
      </div>
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
