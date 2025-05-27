import React, { useState, useEffect, useRef } from "react";
import { Stethoscope, Calendar, Plus, Send, Mic } from "lucide-react";
import FixedSectionContainer from "@/components/FixedSectionContainer";
import HomeButton from "@/components/HomeButton";
import BottomNav from "@/components/BottomNav";
import ChatMessage from "@/components/ChatMessage";
import { Message } from "@/types";
import OpenAI from 'openai';

interface Appointment {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  location?: string;
}

interface LLMResponse {
  status: "complete" | "asking" | "unsupported";
  response: string;
  time?: string;
  date?: string;
  location?: string;
}

const AppointmentsPage: React.FC = () => {
  const [showNewAppointmentForm, setShowNewAppointmentForm] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Create dynamic dates for appointments
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

  const [appointments, setAppointments] = useState<Appointment[]>([
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

  // Function to format appointment date based on time remaining
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
      // Less than a week - show "this Tuesday, June 25 2025"
      const dayName = dayNames[appointmentDate.getDay()];
      const month = monthNames[appointmentDate.getMonth()];
      const day = appointmentDate.getDate();
      const year = appointmentDate.getFullYear();
      return `this ${dayName}, ${month} ${day} ${year}`;
    } else {
      // More than a week - show "on June 25 2025"
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

  const sortedAppointments = appointments.sort((a, b) => 
    new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime()
  );

  const callLLM = async (userMessage: string, conversationHistory: Message[]): Promise<LLMResponse> => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('No API key found in environment variables');
      throw new Error('OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your environment variables.');
    }

    const systemPrompt = `You are an appointment scheduling assistant for a healthcare app. Your job is to help users schedule medical appointments by gathering the necessary information: appointment type, date, time, and location.

You have access to the full conversation history, so you can reference previous messages and build upon the information already gathered.

ALL of your responses must contain only valid JSON (no extra characters or delimiters). You must respond with valid JSON in this exact format:
{
  "status": "complete"|"asking"|"unsupported",
  "response": "<your message to the user>",
  "time": "HH:MM"|null,
  "date": "MM/DD/YYYY"|null,
  "location": "<location>"|null
}

Rules:
- Be concise
- Use "asking" status when you need more information from the user
- If a user doesn't know the value for a specific field, use TBD for that field
- If a user enters an invalid value for a field three times, skip that field and use TBD
- Use "complete" status only when you have all required info: appointment type, date, time, and location
- Use "unsupported" status for non-appointment related requests
- For "complete" status, include time in 24-hour format (e.g., "14:30" for 2:30 PM)
- For "complete" status, include date in MM/DD/YYYY format
- Parse natural language dates like "tomorrow", "January 15", "next Monday"
- Be conversational and helpful in your responses
- Remember information from previous messages in the conversation
- Ask for one piece of missing information at a time
- If a user provides multiple pieces of information at once, acknowledge all of them
- Your responses must only contain valid JSON with the above format
- If you ask for the location, use this question: "What is the location of the appointment, if you know it?"`;

    try {
      // Convert conversation history to OpenAI format
      const conversationMessages = conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }));
      
      // Add the new user message
      conversationMessages.push({ role: 'user', content: userMessage });
      
      const requestBody = {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationMessages
        ],
        temperature: 0.7,
        max_tokens: 300,
      };
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error response:', errorText);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      
      const assistantMessage = data.choices[0]?.message?.content;

      if (!assistantMessage) {
        throw new Error('No response from OpenAI');
      }

      // Parse the JSON response
      try {
        const llmResponse: LLMResponse = JSON.parse(assistantMessage);
        return llmResponse;
      } catch (parseError) {
        console.warn('JSON parsing failed, using fallback response. Parse error:', parseError);
        console.warn('Raw assistant message:', assistantMessage);
        // If JSON parsing fails, return a fallback response
        return {
          status: "asking",
          response: assistantMessage
        };
      }
    } catch (error) {
      throw error;
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || isProcessing) {
      return;
    }

    setIsProcessing(true);
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: chatInput,
      role: 'user',
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    try {
      // Call LLM with full conversation history
      const llmResponse = await callLLM(chatInput, chatMessages);
      
      // Add LLM response to chat
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: llmResponse.response,
        role: 'assistant',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botMessage]);

      // Handle different status responses
      if (llmResponse.status === 'complete') {
        // Create new appointment from LLM response
        if (llmResponse.date && llmResponse.time) {
          const newAppointment: Appointment = {
            id: Date.now().toString(),
            doctor: 'TBD', // LLM can specify doctor in location or we can parse from response
            specialty: 'Appointment', // Could be extracted from response
            date: llmResponse.date.split('/').reverse().join('-'), // Convert MM/DD/YYYY to YYYY-MM-DD
            time: llmResponse.time,
            location: llmResponse.location || 'TBD'
          };

          setAppointments(prev => [...prev, newAppointment]);
          
          // Close chat after successful appointment creation
          setTimeout(() => {
            setShowChat(false);
            setChatMessages([]);
          }, 2000);
        }
      }
      // For 'asking' and 'unsupported' status, we just display the response (already done above)
      
    } catch (error) {
      console.error('Error calling LLM - Full error object:', error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('API key not found')) {
          errorMessage = 'OpenAI API key is not configured. Please set up your API key.';
        } else if (error.message.includes('API error')) {
          errorMessage = 'There was an issue connecting to the AI service. Please try again.';
        } else if (error.message.includes('No response')) {
          errorMessage = 'The AI service did not provide a response. Please try again.';
        }
      }
      
      const errorMsg: Message = {
        id: (Date.now() + 2).toString(),
        content: errorMessage,
        role: 'assistant',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const startAppointmentChat = () => {
    setShowChat(true);
    
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content: `I'll help you schedule an appointment. Please provide this information. Skip any information that you don't know:
      - doctor's name
      - location
      - date and time`,
      role: 'assistant',
      timestamp: new Date()
    };
    
    setChatMessages([welcomeMessage]);
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

      // Convert blob to File for OpenAI SDK
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
            setChatInput(transcription.trim());
          } else {
            alert('No speech detected. Please try again.');
          }
        } catch (error) {
          console.error('Transcription error:', error);
          alert('Failed to transcribe audio. Please try again or type your message.');
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

  const handleVoiceButtonClick = () => {
    if (isProcessing) return;
    
    if (isRecording) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <HomeButton />
      <FixedSectionContainer>
        <div className="space-y-4 mb-4">
          <h2 className="text-2xl font-bold text-heart-dark">Appointments</h2>
          <button
            onClick={() => setShowNewAppointmentForm(!showNewAppointmentForm)}
            className="flex items-center gap-2 px-4 py-2 bg-heart text-white rounded-lg hover:bg-heart-dark transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add New Appointment
          </button>
        </div>

        {/* New Appointment Form */}
        {showNewAppointmentForm && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="text-lg font-medium mb-4">Schedule New Appointment</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Doctor/Specialist</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:border-heart focus:outline-none"
                  placeholder="Enter doctor name or specialty"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:border-heart focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <input
                  type="time"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:border-heart focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:border-heart focus:outline-none"
                  placeholder="Enter clinic or hospital location"
                />
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-heart text-white rounded-lg hover:bg-heart-dark transition-colors">
                  Save Appointment
                </button>
                <button
                  onClick={() => setShowNewAppointmentForm(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {sortedAppointments.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              {sortedAppointments.map((appointment) => (
                <div 
                  key={appointment.id} 
                  className="flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-heart transition-colors"
                >
                  <div className="bg-teal-100 p-3 rounded-full">
                    <Stethoscope className="h-6 w-6 text-teal-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">
                      Appointment with {appointment.specialty}
                    </h3>
                    <p className="text-gray-600 font-bold underline">
                      {formatAppointmentDate(appointment.date)} at {formatTime(appointment.time)}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Stethoscope className="h-4 w-4" />
                        <span>{appointment.doctor}</span>
                      </div>
                      {appointment.location && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{appointment.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No Appointments Scheduled</h3>
              <p className="text-gray-500">You don't have any upcoming appointments.</p>
            </div>
          )}
        </div>

        {/* Second Add Appointment Button */}
        <div className="mt-6 text-center">
          <button
            onClick={startAppointmentChat}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mx-auto"
          >
            <Plus className="h-4 w-4" />
            Add Appointment with Assistant
          </button>
        </div>

        {/* Chat Interface */}
        {showChat && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <h4 className="text-lg font-medium">Appointment Assistant</h4>
              <button
                onClick={() => {
                  setShowChat(false);
                  setChatMessages([]);
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div 
              ref={chatMessagesRef}
              className="h-64 overflow-y-auto p-4 scroll-smooth"
            >
              {chatMessages.map((message, index) => (
                <ChatMessage key={index} message={message} />
              ))}
            </div>
            
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => {
                    setChatInput(e.target.value);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !isProcessing) {
                      handleChatSubmit();
                    }
                  }}
                  placeholder={isProcessing ? "Processing..." : "Type your message..."}
                  disabled={isProcessing}
                  className="flex-1 rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleVoiceButtonClick}
                  disabled={isProcessing}
                  className={`rounded-lg p-2 text-white transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                      : 'bg-gray-500 hover:bg-gray-600'
                  }`}
                  title={
                    isProcessing 
                      ? "Processing transcription..." 
                      : isRecording 
                        ? "Stop recording" 
                        : "Start voice recording"
                  }
                >
                  <Mic className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    handleChatSubmit();
                  }}
                  disabled={isProcessing}
                  className="rounded-lg bg-blue-500 p-2 text-white hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </FixedSectionContainer>
      <BottomNav />
    </div>
  );
};

export default AppointmentsPage; 