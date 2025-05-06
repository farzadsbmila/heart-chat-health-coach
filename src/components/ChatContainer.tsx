
import React, { useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import { useChatContext } from "@/context/ChatContext";

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

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 chat-container"
    >
      {filteredMessages.map(message => (
        <ChatMessage key={message.id} message={message} />
      ))}
    </div>
  );
};

export default ChatContainer;
