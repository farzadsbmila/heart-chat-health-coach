import React, { useState, useEffect, useRef } from "react";
import { Mic, X } from "lucide-react";
import HomeButton from "@/components/HomeButton";
import BottomNav from "@/components/BottomNav";
import ChatMessage from "@/components/ChatMessage";
import { Message } from "@/types";
import OpenAI from 'openai';

const VoiceModePage: React.FC = () => {
  const [showChatOverlay, setShowChatOverlay] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const callLLM = async (userMessage: string, conversationHistory: Message[]): Promise<string> => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your environment variables.');
    }

    const systemPrompt = `You are a helpful health assistant for a cardiac monitoring app called Cardio Twin. You help users with general health questions, appointment scheduling, medication reminders, and cardiac health guidance. 

You have access to the full conversation history, so you can reference previous messages and build upon the information already gathered.

Keep responses concise and friendly. If users ask about serious symptoms, advise them to contact their healthcare provider immediately. You can help with:
- General health questions
- Appointment scheduling guidance
- Medication reminders
- Cardiac health tips
- Lifestyle recommendations
- Emergency guidance

Always be supportive and professional in your responses.`;

    try {
      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });

      // Prepare input for the Responses API
      const input = [
        { role: 'system', content: systemPrompt, type: 'message' },
        ...conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content,
          type: 'message'
        })),
        { role: 'user', content: userMessage, type: 'message' }
      ];

      const response = await openai.responses.create({
        model: 'gpt-4o',
        input,
        temperature: 0.7
      });

      return response.output_text || 'Sorry, I could not process your request.';
    } catch (error) {
      console.error('Error calling OpenAI Responses API:', error);
      throw error;
    }
  };

  const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not configured for voice transcription.');
    }

    try {
      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });

      const audioFile = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });

      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: 'en',
        response_format: 'text'
      });

      return transcription.trim();
    } catch (error) {
      console.error('OpenAI transcription error:', error);
      throw error;
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { 
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : 'audio/webm' 
      });
      
      const audioChunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        setIsProcessing(true);
        try {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          const transcription = await transcribeAudio(audioBlob);
          
          if (transcription.trim()) {
            // Add user message
            const userMessage: Message = {
              id: Date.now().toString(),
              content: transcription.trim(),
              role: 'user',
              timestamp: new Date()
            };
            setChatMessages(prev => [...prev, userMessage]);

            // Get AI response
            try {
              const aiResponse = await callLLM(transcription.trim(), chatMessages);
              const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: aiResponse,
                role: 'assistant',
                timestamp: new Date()
              };
              setChatMessages(prev => [...prev, botMessage]);
            } catch (error) {
              const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: 'Sorry, I encountered an error. Please try again.',
                role: 'assistant',
                timestamp: new Date()
              };
              setChatMessages(prev => [...prev, errorMessage]);
            }
          } else {
            alert('No speech detected. Please try again.');
          }
        } catch (error) {
          console.error('Transcription error:', error);
          alert('Failed to transcribe audio. Please try again.');
        } finally {
          setIsProcessing(false);
        }
        
        // Clean up media stream
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions and try again.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setMediaRecorder(null);
      setIsRecording(false);
    }
  };

  const handleMicrophoneClick = () => {
    if (!showChatOverlay) {
      setShowChatOverlay(true);
      setChatMessages([{
        id: Date.now().toString(),
        content: "Hello! I'm your health assistant. How can I help you today? Just tap the microphone and start speaking.",
        role: 'assistant',
        timestamp: new Date()
      }]);
    } else {
      if (isProcessing) return;
      
      if (isRecording) {
        stopVoiceRecording();
      } else {
        startVoiceRecording();
      }
    }
  };

  const closeChatOverlay = () => {
    setShowChatOverlay(false);
    setChatMessages([]);
    if (isRecording) {
      stopVoiceRecording();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <HomeButton />
      
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <h1 className="text-4xl font-bold mb-8 text-heart-dark">Voice Mode</h1>
        <p className="text-lg text-gray-600 mb-12 text-center max-w-md">
          Tap the microphone to start a voice conversation with your health assistant
        </p>
        
        {/* Large Microphone Button */}
        <button
          onClick={handleMicrophoneClick}
          className="w-32 h-32 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 transform hover:scale-105"
          style={{ borderRadius: '50px' }}
        >
          <Mic className="h-16 w-16 text-white" />
        </button>
        
        <p className="text-sm text-gray-500 mt-4">
          Tap to start voice conversation
        </p>
      </div>

      {/* Chat Overlay */}
      {showChatOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col justify-between z-50 p-4">
          {/* Close Button */}
          <div className="flex justify-end">
            <button
              onClick={closeChatOverlay}
              className="text-white hover:text-gray-300 p-2 rounded-full bg-black bg-opacity-50"
            >
              <X className="h-8 w-8" />
            </button>
          </div>
          
          {/* Messages Area */}
          <div 
            ref={chatMessagesRef}
            className="flex-1 overflow-y-auto px-4 py-8 scroll-smooth max-w-4xl mx-auto w-full"
          >
            {chatMessages.map((message, index) => (
              <div key={index} className={`mb-6 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div
                  className={`inline-block max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-white text-gray-800'
                      : 'bg-black bg-opacity-80 text-white'
                  }`}
                >
                  <p className="text-lg">{message.content}</p>
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <p className="text-white text-sm mt-2">Processing your message...</p>
              </div>
            )}
          </div>
          
          {/* Voice Control */}
          <div className="flex flex-col items-center py-4">
            <button
              onClick={() => {
                if (isProcessing) return;
                if (isRecording) {
                  stopVoiceRecording();
                } else {
                  startVoiceRecording();
                }
              }}
              disabled={isProcessing}
              className={`rounded-full p-6 text-white transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-2xl' 
                  : 'bg-blue-500 hover:bg-blue-600 shadow-2xl'
              }`}
              title={
                isProcessing 
                  ? "Processing..." 
                  : isRecording 
                    ? "Stop recording" 
                    : "Start recording"
              }
            >
              <Mic className="h-10 w-10" />
            </button>
            <p className="text-center text-white text-lg mt-4 font-medium">
              {isProcessing 
                ? "Processing your message..." 
                : isRecording 
                  ? "Recording... Tap to stop" 
                  : "Tap microphone to speak"
              }
            </p>
          </div>
        </div>
      )}
      
      <BottomNav />
    </div>
  );
};

export default VoiceModePage; 