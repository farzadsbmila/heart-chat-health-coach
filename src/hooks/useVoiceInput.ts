
import { useState, useEffect, useCallback, useRef } from "react";
import { VoiceState } from "@/types";

interface UseVoiceInputProps {
  onTranscriptComplete: (transcript: string) => void;
}

const useVoiceInput = ({ onTranscriptComplete }: UseVoiceInputProps) => {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isRecording: false,
    transcript: "",
    isProcessing: false
  });
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const startRecording = useCallback(() => {
    try {
      // Check if browser supports SpeechRecognition
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("Speech recognition is not supported in your browser");
        return;
      }

      // Use the appropriate SpeechRecognition constructor
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      // Create a new instance
      recognitionRef.current = new SpeechRecognition();
      
      // Set properties
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      // Start recording
      recognitionRef.current.start();
      
      setVoiceState(prev => ({
        ...prev,
        isRecording: true,
        transcript: ""
      }));
      
      // Set up event handlers
      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        const fullTranscript = finalTranscript || interimTranscript;
        
        setVoiceState(prev => ({
          ...prev,
          transcript: fullTranscript
        }));
        
        // Reset silence detection timer
        if (timeoutRef.current) {
          window.clearTimeout(timeoutRef.current);
        }
        
        // Set new silence detection timer
        timeoutRef.current = window.setTimeout(() => {
          stopRecording();
        }, 2000); // Stop after 2 seconds of silence
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event);
        stopRecording();
      };
      
    } catch (error) {
      console.error("Error starting voice recording:", error);
      stopRecording();
    }
  }, []);
  
  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setVoiceState(prev => {
      // Only process if there's actual content
      if (prev.transcript.trim()) {
        onTranscriptComplete(prev.transcript.trim());
      }
      
      return {
        isRecording: false,
        transcript: "",
        isProcessing: prev.transcript.trim() ? true : false
      };
    });
    
    // Reset processing state after a short delay
    setTimeout(() => {
      setVoiceState(prev => ({...prev, isProcessing: false}));
    }, 500);
    
  }, [onTranscriptComplete]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return {
    voiceState,
    startRecording,
    stopRecording
  };
};

export default useVoiceInput;
