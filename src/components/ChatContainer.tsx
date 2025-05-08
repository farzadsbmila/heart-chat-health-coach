
import React, { useRef, useEffect, useState } from "react";
import ChatMessage from "./ChatMessage";
import { useChatContext } from "@/context/ChatContext";
import RiskProfileSection from "./RiskProfileSection";
import RecommendationsSection from "./RecommendationsSection";
import CoachingSection from "./CoachingSection";
import MinifiedHeader from "./MinifiedHeader";

const ChatContainer: React.FC = () => {
  const { messages, currentView } = useChatContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const fixedSectionRef = useRef<HTMLDivElement>(null);
  const [showMinifiedHeader, setShowMinifiedHeader] = useState(false);

  // Filter messages by current view
  const filteredMessages = messages.filter(message => 
    message.view === currentView || message.view === "general" || !message.view
  );
  
  // Check if there are any messages in the current view
  const hasMessagesInCurrentView = filteredMessages.length > 0;

  // Scroll to bottom only when new messages are added
  useEffect(() => {
    const container = containerRef.current;
    if (container && hasMessagesInCurrentView) {
      // Store the current scroll position
      const wasAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
      
      // Only scroll to bottom if we were already near the bottom
      if (wasAtBottom) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [filteredMessages, hasMessagesInCurrentView]);

  // Handle scroll to detect when to show minified header
  useEffect(() => {
    const container = containerRef.current;
    const fixedSection = fixedSectionRef.current;
    
    if (!container || !fixedSection || currentView === "general") return;
    
    const handleScroll = () => {
      const scrollPosition = container.scrollTop;
      const threshold = 100; // Show minified header after scrolling 100px
      
      // Show minified header when scrolling past threshold
      setShowMinifiedHeader(scrollPosition > threshold);
    };
    
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [currentView]);

  // Function to scroll back to the top
  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  };

  // Render the appropriate fixed section based on the current view
  const renderFixedSection = () => {
    switch (currentView) {
      case "risk":
        return <div ref={fixedSectionRef}><RiskProfileSection /></div>;
      case "recommendations":
        return <div ref={fixedSectionRef}><RecommendationsSection /></div>;
      case "coaching":
        return <div ref={fixedSectionRef}><CoachingSection /></div>;
      default:
        return null;
    }
  };

  return (
    <>
      {showMinifiedHeader && <MinifiedHeader scrollToTop={scrollToTop} />}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-6 chat-container flex flex-col items-center bg-gray-50"
      >
        <div className="w-full max-w-4xl"> {/* Center container with max width */}
          {/* Render fixed section if we're on a specialized view */}
          {currentView !== "general" && renderFixedSection()}
          
          {/* Render chat messages - for any view that has messages */}
          {filteredMessages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>
      </div>
    </>
  );
};

export default ChatContainer;
