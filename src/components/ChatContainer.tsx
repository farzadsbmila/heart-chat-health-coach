
import React, { useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import { useChatContext } from "@/context/ChatContext";
import RiskProfileSection from "./RiskProfileSection";
import RecommendationsSection from "./RecommendationsSection";
import CoachingSection from "./CoachingSection";

const ChatContainer: React.FC = () => {
  const { messages, currentView } = useChatContext();
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter messages by current view
  const filteredMessages = messages.filter(message => 
    message.view === currentView || message.view === "general" || !message.view
  );

  // Scroll to bottom when messages change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [filteredMessages]);

  // Render the appropriate fixed section based on the current view
  const renderFixedSection = () => {
    switch (currentView) {
      case "risk":
        return <RiskProfileSection />;
      case "recommendations":
        return <RecommendationsSection />;
      case "coaching":
        return <CoachingSection />;
      default:
        return null;
    }
  };

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-6 chat-container flex flex-col items-center bg-gray-50"
    >
      <div className="w-full max-w-4xl"> {/* Center container with max width */}
        {/* Render fixed section if we're on a specialized view */}
        {currentView !== "general" && renderFixedSection()}
        
        {/* Render chat messages - but only if we're on the general view */}
        {currentView === "general" && filteredMessages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>
    </div>
  );
};

export default ChatContainer;
