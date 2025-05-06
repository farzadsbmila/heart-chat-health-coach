
import React from "react";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";

interface VoiceActivationButtonProps {
  onClick: () => void;
  isRecording: boolean;
}

const VoiceActivationButton: React.FC<VoiceActivationButtonProps> = ({ 
  onClick, 
  isRecording 
}) => {
  return (
    <Button
      onClick={onClick}
      className={`fixed bottom-24 right-6 md:right-10 rounded-full w-14 h-14 flex items-center justify-center shadow-lg ${
        isRecording 
          ? "bg-health-orange hover:bg-health-orange/90" 
          : "bg-heart hover:bg-heart-dark"
      }`}
    >
      <div className={`relative ${isRecording ? "wave-animation" : ""}`}>
        <Mic className="h-6 w-6" />
        {isRecording && (
          <>
            <div className="absolute inset-0 rounded-full bg-heart-light opacity-20 animate-ping" />
            <div className="absolute inset-0 rounded-full bg-heart-light opacity-40 animate-pulse" />
          </>
        )}
      </div>
    </Button>
  );
};

export default VoiceActivationButton;
