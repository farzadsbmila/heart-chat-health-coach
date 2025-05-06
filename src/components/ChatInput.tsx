
import React, { useState, useRef, useEffect } from "react";
import { useChatContext } from "@/context/ChatContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Send, MicOff } from "lucide-react";
import useVoiceInput from "@/hooks/useVoiceInput";
import { generateResponse } from "@/utils/healthResponses";

const ChatInput: React.FC = () => {
  const [inputValue, setInputValue] = useState("");
  const { addMessage, currentView } = useChatContext();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleSubmit = (text: string) => {
    if (!text.trim()) return;
    
    // Add user message
    addMessage("user", text);
    
    // Reset input
    setInputValue("");
    
    // Generate response (in a real app, this would likely be an API call)
    setTimeout(() => {
      const response = generateResponse(text, currentView);
      addMessage("assistant", response);
    }, 500);
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter without Shift
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(inputValue);
    }
  };

  const { voiceState, startRecording, stopRecording } = useVoiceInput({
    onTranscriptComplete: (transcript) => {
      setInputValue(transcript);
      // Auto-submit the voice input after receiving it
      setTimeout(() => handleSubmit(transcript), 200);
    }
  });

  useEffect(() => {
    // Resize textarea based on content
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  return (
    <div className="border-t bg-white px-4 pt-3 pb-5 shadow-lg">
      <div className="flex items-end gap-2">
        <div className="flex-grow relative">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleTextareaKeyDown}
            placeholder="Type your message or press mic to speak..."
            className="pr-12 min-h-[60px] max-h-[150px] resize-none"
            disabled={voiceState.isRecording}
          />
          {voiceState.isRecording && (
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <span className="recording-dot active"></span>
              <span className="text-sm text-health-orange animate-pulse">Recording...</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {voiceState.isRecording ? (
            <Button 
              onClick={stopRecording} 
              size="icon" 
              className="bg-health-orange hover:bg-health-orange/90"
            >
              <MicOff className="h-6 w-6" />
            </Button>
          ) : (
            <Button 
              onClick={startRecording} 
              size="icon" 
              variant="outline"
              className="border-heart text-heart hover:text-heart-dark hover:bg-heart/10"
            >
              <Mic className="h-6 w-6" />
            </Button>
          )}

          <Button 
            onClick={() => handleSubmit(inputValue)} 
            size="icon" 
            className="bg-heart hover:bg-heart-dark"
            disabled={!inputValue.trim() || voiceState.isRecording}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {voiceState.transcript && voiceState.isRecording && (
        <div className="mt-2 text-sm text-muted-foreground">
          {voiceState.transcript}
        </div>
      )}
    </div>
  );
};

export default ChatInput;
