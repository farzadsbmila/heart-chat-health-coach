
import React from "react";
import { Message } from "@/types";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAssistant = message.role === "assistant";
  
  // Format the timestamp
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(message.timestamp);

  return (
    <div className={cn(
      "flex mb-4",
      isAssistant ? "justify-start" : "justify-end"
    )}>
      <div className={cn(
        "chat-bubble",
        isAssistant 
          ? "chat-bubble-assistant bg-heart rounded-tr-2xl rounded-br-2xl rounded-bl-2xl" 
          : "chat-bubble-user rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl"
      )}>
        <div className="flex flex-col">
          <div className="whitespace-pre-wrap">
            {message.content.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i < message.content.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>
          <div className={cn(
            "text-xs mt-1 self-end",
            isAssistant ? "text-heart-light" : "text-gray-500"
          )}>
            {formattedTime}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
