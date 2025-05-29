import React, { useState, useEffect, useRef } from "react";
import { Mic, X, Send, Stethoscope, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import HomeButton from "@/components/HomeButton";
import BottomNav from "@/components/BottomNav";
import ChatMessage from "@/components/ChatMessage";
import { Message } from "@/types";
import OpenAI from 'openai';

// Navigation mapping for voice commands
const NAVIGATION_SECTIONS = {
  'home': '/',
  'chat': '/chat', 
  'risk': '/risk-profile',
  'risk profile': '/risk-profile',
  'recommendations': '/recommendations',
  'recs': '/recommendations',
  'coaching': '/coaching',
  'coach': '/coaching',
  'alerts': '/alerts',
  'calendar': '/calendar',
  'appointments': '/appointments',
  'voice mode': '/voice-mode'
} as const;

// Toggle to enable/disable text input in voice mode
const ENABLE_TEXT_INPUT = true;

interface Appointment {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  location?: string;
}

const VoiceModePage: React.FC = () => {
  const navigate = useNavigate();
  const [showChatOverlay, setShowChatOverlay] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [textInput, setTextInput] = useState("");
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  // Create dynamic dates for appointments (same logic as Appointments.tsx)
  const getDatePlusDays = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  const getDatePlusMonths = (months: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
  };

  // Sample appointments data (same as Appointments.tsx)
  const [appointments] = useState<Appointment[]>([
    {
      id: '1',
      doctor: 'Dr. Smith',
      specialty: 'Cardiologist',
      date: getDatePlusDays(1), // Tomorrow
      time: '10:00',
      location: 'Heart Center, Room 205'
    },
    {
      id: '2',
      doctor: 'Dr. Johnson',
      specialty: 'Cardiologist',
      date: getDatePlusMonths(1), // Next month
      time: '14:30',
      location: 'Cardiac Clinic, Floor 3'
    }
  ]);

  // Utility functions for formatting (same as Appointments.tsx)
  const formatAppointmentDate = (dateString: string) => {
    const appointmentDate = new Date(dateString + 'T00:00:00');
    const today = new Date();
    const timeDiff = appointmentDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    if (daysDiff <= 7 && daysDiff > 0) {
      const dayName = dayNames[appointmentDate.getDay()];
      const month = monthNames[appointmentDate.getMonth()];
      const day = appointmentDate.getDate();
      const year = appointmentDate.getFullYear();
      return `this ${dayName}, ${month} ${day} ${year}`;
    } else {
      const month = monthNames[appointmentDate.getMonth()];
      const day = appointmentDate.getDate();
      const year = appointmentDate.getFullYear();
      return `on ${month} ${day} ${year}`;
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Helper function to handle navigation
  const handleNavigation = (aiResponse: string): string => {
    const lowercaseResponse = aiResponse.toLowerCase();
    
    // Check if the response contains navigation instructions
    if (lowercaseResponse.includes('[navigate:') && lowercaseResponse.includes(']')) {
      const navigationMatch = lowercaseResponse.match(/\[navigate:\s*([^\]]+)\]/);
      if (navigationMatch) {
        const sectionName = navigationMatch[1].trim();
        const targetPath = NAVIGATION_SECTIONS[sectionName as keyof typeof NAVIGATION_SECTIONS];
        
        if (targetPath) {
          // Navigate after a short delay to allow the message to be displayed
          setTimeout(() => {
            navigate(targetPath);
          }, 1500);
          
          // Return the response without the navigation command
          return aiResponse.replace(/\[navigate:\s*[^\]]+\]/gi, '').trim();
        }
      }
    }

    // Check if the response contains appointment viewing instructions
    if (lowercaseResponse.includes('[show_appointments]')) {
      // Add appointments to chat after a short delay
      setTimeout(() => {
        displayAppointmentsInChat();
      }, 500);
      
      // Return the response without the appointment command
      return aiResponse.replace(/\[show_appointments\]/gi, '').trim();
    }
    
    return aiResponse;
  };

  // Function to display appointments in chat
  const displayAppointmentsInChat = () => {
    const sortedAppointments = appointments.sort((a, b) => 
      new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime()
    );

    if (sortedAppointments.length === 0) {
      const noAppointmentsMessage: Message = {
        id: Date.now().toString(),
        content: "You don't have any upcoming appointments scheduled.",
        role: 'assistant',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, noAppointmentsMessage]);
      return;
    }

    // Create appointment display message
    let appointmentsList = "Here are your upcoming appointments:\n\n";
    
    sortedAppointments.forEach((appointment, index) => {
      appointmentsList += `${index + 1}. **${appointment.specialty}** with ${appointment.doctor}\n`;
      appointmentsList += `   📅 ${formatAppointmentDate(appointment.date)} at ${formatTime(appointment.time)}\n`;
      if (appointment.location) {
        appointmentsList += `   📍 ${appointment.location}\n`;
      }
      appointmentsList += "\n";
    });

    const appointmentsMessage: Message = {
      id: Date.now().toString(),
      content: appointmentsList.trim(),
      role: 'assistant',
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, appointmentsMessage]);
  };

  const callLLM = async (userMessage: string, conversationHistory: Message[]): Promise<string> => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your environment variables.');
    }

    const systemPrompt = `You are a helpful health assistant for a cardiac monitoring app called Cardio Twin. You help users with general health questions, appointment scheduling, medication reminders, and cardiac health guidance. 

You have access to the full conversation history, so you can reference previous messages and build upon the information already gathered.

IMPORTANT: You can also help users navigate to different sections of the app. When a user requests to go to a specific section, include a navigation command in your response using this format: [navigate: section_name]

Available sections are:
- home: Main dashboard
- chat: Text chat interface
- risk: Risk profile assessment
- recommendations: Health recommendations  
- coaching: Health coaching content
- alerts: Health alerts and notifications
- calendar: Calendar view
- appointments: Appointment management
- voice mode: Voice conversation mode (current section)

Examples of navigation responses:
- "I'll take you to your appointments section now. [navigate: appointments]"
- "Let me open the risk profile for you. [navigate: risk]"
- "Sure, I'll navigate you to the recommendations section. [navigate: recommendations]"

IMPORTANT: You can also show users their current appointments. When a user asks to see their appointments, upcoming appointments, scheduled appointments, or asks "what appointments do I have", include this command in your response: [show_appointments]

Examples of appointment viewing responses:
- "Let me show you your upcoming appointments. [show_appointments]"
- "Here are your scheduled appointments. [show_appointments]"
- "I'll display your current appointments for you. [show_appointments]"

Keep responses concise and friendly. If users ask about serious symptoms, advise them to contact their healthcare provider immediately. You can help with:
- General health questions
- Appointment scheduling guidance
- Medication reminders
- Cardiac health tips
- Lifestyle recommendations
- Emergency guidance
- Navigation between app sections
- Viewing current appointments

Always be supportive and professional in your responses.`;

    try {
      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });

      // Convert conversation history to OpenAI format
      const conversationMessages = conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }));
      
      // Add the new user message
      conversationMessages.push({ role: 'user', content: userMessage });

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationMessages
        ],
        temperature: 0.7,
        max_tokens: 300,
      });

      const aiResponse = completion.choices[0]?.message?.content || 'Sorry, I could not process your request.';
      return handleNavigation(aiResponse);
    } catch (error) {
      console.error('Error calling OpenAI:', error);
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
        try {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          const transcription = await transcribeAudio(audioBlob);
          
          if (transcription.trim()) {
            await processUserMessage(transcription.trim());
          } else {
            alert('No speech detected. Please try again.');
          }
        } catch (error) {
          console.error('Transcription error:', error);
          alert('Failed to transcribe audio. Please try again.');
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

  const processUserMessage = async (messageText: string) => {
    if (!messageText.trim()) return;
    
    setIsProcessing(true);

    try {
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        content: messageText.trim(),
        role: 'user',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, userMessage]);

      // Get AI response
      try {
        const aiResponse = await callLLM(messageText.trim(), chatMessages);
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
    } catch (error) {
      console.error('Error processing message:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const sendTextMessage = async () => {
    if (!textInput.trim() || isProcessing) return;
    
    const messageText = textInput.trim();
    setTextInput("");
    
    await processUserMessage(messageText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage();
    }
  };

  const handleMicrophoneClick = () => {
    if (!showChatOverlay) {
      setShowChatOverlay(true);
      setChatMessages([{
        id: Date.now().toString(),
        content: ENABLE_TEXT_INPUT 
          ? "Hello! I'm your health assistant. How can I help you today? I can answer health questions, help with appointments, show your scheduled appointments, and even navigate you to different sections of the app. You can speak using the microphone or type your message!"
          : "Hello! I'm your health assistant. How can I help you today? I can answer health questions, help with appointments, show your scheduled appointments, and even navigate you to different sections of the app. Just tap the microphone and start speaking!",
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
    setTextInput("");
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
          
          {/* Text Input Area */}
          {ENABLE_TEXT_INPUT && (
            <div className="px-4 py-2 max-w-4xl mx-auto w-full">
              <div className="flex items-center space-x-2 bg-white bg-opacity-90 rounded-lg p-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  disabled={isProcessing}
                  className="flex-1 px-3 py-2 bg-transparent border-none outline-none text-gray-800 placeholder-gray-500"
                />
                <button
                  onClick={sendTextMessage}
                  disabled={!textInput.trim() || isProcessing}
                  className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  <Send className="h-5 w-5 text-white" />
                </button>
              </div>
              <p className="text-center text-white text-sm mt-2 opacity-75">
                Type your message or use voice below
              </p>
            </div>
          )}
          
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