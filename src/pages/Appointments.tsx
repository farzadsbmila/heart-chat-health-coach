import React, { useState, useEffect, useRef } from "react";
import { Stethoscope, Calendar, Clock, Plus, Send } from "lucide-react";
import FixedSectionContainer from "@/components/FixedSectionContainer";
import HomeButton from "@/components/HomeButton";
import BottomNav from "@/components/BottomNav";
import ChatMessage from "@/components/ChatMessage";
import { Message } from "@/types";

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
  console.log('AppointmentsPage component rendering');
  
  const [showNewAppointmentForm, setShowNewAppointmentForm] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  
  console.log('Component state:', { showChat, chatMessages: chatMessages.length, chatInput, isProcessing });

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
    console.log('callLLM function started with message:', userMessage);
    
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    console.log('API key check:', apiKey ? 'API key found' : 'API key missing');
    
    if (!apiKey) {
      console.error('No API key found in environment variables');
      throw new Error('OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your environment variables.');
    }

    const systemPrompt = `You are an appointment scheduling assistant for a healthcare app. Your job is to help users schedule medical appointments by gathering the necessary information: appointment type, date, time, and location.

You have access to the full conversation history, so you can reference previous messages and build upon the information already gathered.

You must respond with valid JSON in this exact format:
{
  "status": "complete"|"asking"|"unsupported",
  "response": "<your message to the user>",
  "time": "HH:MM"|null,
  "date": "MM/DD/YYYY"|null,
  "location": "<location>"|null
}

Rules:
- Use "asking" status when you need more information from the user
- Use "complete" status only when you have all required info: appointment type, date, time, and location
- Use "unsupported" status for non-appointment related requests
- For "complete" status, include time in 24-hour format (e.g., "14:30" for 2:30 PM)
- For "complete" status, include date in MM/DD/YYYY format
- Parse natural language dates like "tomorrow", "January 15", "next Monday"
- Be conversational and helpful in your responses
- Remember information from previous messages in the conversation
- Ask for one piece of missing information at a time
- If a user provides multiple pieces of information at once, acknowledge all of them`;

    try {
      console.log('Making fetch request to OpenAI API...');
      console.log('Conversation history length:', conversationHistory.length);
      
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
      console.log('Request body with full conversation:', requestBody);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Fetch response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error response:', errorText);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('OpenAI API response data:', data);
      
      const assistantMessage = data.choices[0]?.message?.content;
      console.log('Assistant message:', assistantMessage);

      if (!assistantMessage) {
        throw new Error('No response from OpenAI');
      }

      // Parse the JSON response
      try {
        console.log('Attempting to parse JSON response...');
        const llmResponse: LLMResponse = JSON.parse(assistantMessage);
        console.log('Parsed LLM response:', llmResponse);
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
      console.error('OpenAI API call failed - detailed error:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error.constructor.name);
      throw error;
    }
  };

  const parseDateTime = (input: string): { date: string; time: string } | null => {
    const now = new Date();
    let date = '';
    let time = '';

    // Handle "tomorrow"
    if (input.toLowerCase().includes('tomorrow')) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      date = tomorrow.toISOString().split('T')[0];
    }

    // Handle "today"
    if (input.toLowerCase().includes('today')) {
      date = now.toISOString().split('T')[0];
    }

    // Handle specific dates (simple parsing)
    const dateMatch = input.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (dateMatch) {
      const [, month, day, year] = dateMatch;
      date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Handle month names with day (e.g., "January 15", "Jan 15")
    const monthNames = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    const monthAbbrevs = [
      'jan', 'feb', 'mar', 'apr', 'may', 'jun',
      'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
    ];

    const monthDayMatch = input.match(/(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})(?:\s+(\d{4}))?/i);
    if (monthDayMatch) {
      const [, monthName, day, year] = monthDayMatch;
      const monthLower = monthName.toLowerCase();
      
      let monthIndex = monthNames.indexOf(monthLower);
      if (monthIndex === -1) {
        monthIndex = monthAbbrevs.indexOf(monthLower);
      }
      
      if (monthIndex !== -1) {
        const targetYear = year ? parseInt(year) : now.getFullYear();
        const targetMonth = monthIndex + 1; // JavaScript months are 0-indexed
        date = `${targetYear}-${targetMonth.toString().padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }

    // Handle time - more flexible patterns
    // Matches: "2pm", "2:30pm", "2 pm", "2:30 pm", "14:30", etc.
    const timeMatch = input.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)?/);
    if (timeMatch) {
      let [, hours, minutes = '00', period] = timeMatch;
      let hour24 = parseInt(hours);
      
      if (period) {
        if (period.toLowerCase() === 'pm' && hour24 !== 12) {
          hour24 += 12;
        } else if (period.toLowerCase() === 'am' && hour24 === 12) {
          hour24 = 0;
        }
      }
      
      time = `${hour24.toString().padStart(2, '0')}:${minutes}`;
    }

    return date && time ? { date, time } : null;
  };

  const handleChatSubmit = async () => {
    console.log('=== handleChatSubmit called ===');
    console.log('chatInput:', chatInput);
    console.log('isProcessing:', isProcessing);
    
    if (!chatInput.trim() || isProcessing) {
      console.log('Early return - empty input or processing');
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
      console.log('Sending message to LLM:', chatInput);
      
      // Call LLM with full conversation history
      const llmResponse = await callLLM(chatInput, chatMessages);
      console.log('LLM Response received:', llmResponse);
      
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
        console.log('Creating appointment with data:', { date: llmResponse.date, time: llmResponse.time, location: llmResponse.location });
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
    console.log('startAppointmentChat function called');
    setShowChat(true);
    
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content: "I'll help you schedule an appointment. What type of appointment would you like to schedule?",
      role: 'assistant',
      timestamp: new Date()
    };
    
    setChatMessages([welcomeMessage]);
    console.log('Chat started, welcome message added');
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
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(appointment.time)}</span>
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
                    console.log('Input change:', e.target.value);
                    setChatInput(e.target.value);
                  }}
                  onKeyPress={(e) => {
                    console.log('Key pressed:', e.key, 'isProcessing:', isProcessing);
                    if (e.key === "Enter" && !isProcessing) {
                      console.log('Enter pressed, calling handleChatSubmit');
                      handleChatSubmit();
                    }
                  }}
                  placeholder={isProcessing ? "Processing..." : "Type your message..."}
                  disabled={isProcessing}
                  className="flex-1 rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  onClick={() => {
                    console.log('Send button clicked');
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