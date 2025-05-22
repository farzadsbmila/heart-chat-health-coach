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
  
  // Check if the message contains bullet points (options)
  const hasOptions = message.content.includes('• ');
  let mainMessage = message.content;
  let options: string[] = [];
  
  if (hasOptions && isAssistant) {
    // Split the message into main content and options
    const parts = message.content.split('\n\n');
    if (parts.length > 1) {
      mainMessage = parts[0];
      // Get the options part and split by bullet points
      const optionsPart = parts.slice(1).join('\n\n');
      options = optionsPart.split('• ').filter(Boolean).map(opt => opt.trim());
    }
  }

  return (
    <div className={cn(
      "flex mb-6", // Added more bottom margin
      isAssistant ? "justify-start" : "justify-end"
    )}>
      <div className={cn(
        "chat-bubble max-w-3xl", // Increased max width
        isAssistant 
          ? "chat-bubble-assistant bg-green-100 text-gray-800 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl" 
          : "chat-bubble-user rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl"
      )}>
        <div className="flex flex-col">
          <div className="whitespace-pre-wrap text-lg"> {/* Increased font size */}
            {mainMessage.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i < mainMessage.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>
          
          {options.length > 0 && (
            <div className="mt-4 border-t border-heart-light pt-3">
              <ul className="space-y-2">
                {options.map((option, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="mr-2 text-heart-light">•</span>
                    <span className="text-lg">{option}</span> {/* Increased font size */}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className={cn(
            "text-sm mt-2 self-end", // Increased text size slightly
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
