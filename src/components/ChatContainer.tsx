
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

  // Scroll to bottom when messages change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [filteredMessages]);

  // Handle scroll to detect when to show minified header
  useEffect(() => {
    const container = containerRef.current;
    const fixedSection = fixedSectionRef.current;
    
    if (!container || !fixedSection || currentView === "general") return;
    
    const handleScroll = () => {
      const scrollPosition = container.scrollTop;
      const sectionHeight = fixedSection.offsetHeight;
      
      // Show minified header when scrolling past fixed section
      setShowMinifiedHeader(scrollPosition > sectionHeight - 50);
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
          
          {/* Render chat messages - but only if we're on the general view */}
          {currentView === "general" && filteredMessages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>
      </div>
    </>
  );
};

export default ChatContainer;
