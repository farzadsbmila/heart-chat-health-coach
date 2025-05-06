
import { useState, useCallback, useEffect, useRef } from "react";
import { VoiceState } from "@/types";

interface UseVoiceInputProps {
  onTranscriptComplete: (transcript: string) => void;
}

const useVoiceInput = ({ onTranscriptComplete }: UseVoiceInputProps) => {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isRecording: false,
    transcript: "",
    isProcessing: false,
  });

  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition once on mount
  useEffect(() => {
    // Check which speech recognition API is available
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      
      recognition.onstart = () => {
        setVoiceState(prev => ({ ...prev, isRecording: true }));
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setVoiceState(prev => ({
          ...prev,
          transcript: finalTranscript || interimTranscript,
        }));
      };

      recognition.onend = () => {
        const { transcript } = voiceState;
        
        if (transcript) {
          setVoiceState(prev => ({ ...prev, isProcessing: true }));
          onTranscriptComplete(transcript);
        }
        
        setVoiceState(prev => ({ 
          ...prev, 
          isRecording: false, 
          isProcessing: false,
          transcript: "" 
        }));
      };

      recognitionRef.current = recognition;
    } else {
      console.error("Speech recognition not supported");
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error("Error stopping recognition:", error);
        }
      }
    };
  }, [onTranscriptComplete]);

  const startRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error("Error starting recognition:", error);
      }
    } else {
      console.error("Speech recognition not available");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error("Error stopping recognition:", error);
      }
    }
  }, []);

  return {
    voiceState,
    startRecording,
    stopRecording,
  };
};

export default useVoiceInput;
