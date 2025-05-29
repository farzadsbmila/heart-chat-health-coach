import React, { useState, useEffect, useRef } from "react";
import { Mic, X, Send, Stethoscope, Calendar, Volume2, VolumeX, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import HomeButton from "@/components/HomeButton";
import BottomNav from "@/components/BottomNav";
import ChatMessage from "@/components/ChatMessage";
import { RiskProfileWidget } from "@/components/RiskProfileSection";
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

interface AppointmentMessage extends Message {
  type: 'appointment';
  appointments: Appointment[];
}

interface RiskProfileMessage extends Message {
  type: 'risk_profile';
}

interface AppointmentData {
  doctor?: string;
  specialty?: string;
  date?: string;
  time?: string;
  location?: string;
}

interface SchedulingResponse {
  status: "complete" | "asking" | "unsupported";
  response: string;
  time?: string;
  date?: string;
  location?: string;
  doctor?: string;
  specialty?: string;
}

type AgentType = 'main' | 'appointment_scheduler';

// Available OpenAI TTS voices
const TTS_VOICES = [
  { value: 'alloy', label: 'Alloy' },
  { value: 'ash', label: 'Ash' },
  { value: 'ballad', label: 'Ballad' },
  { value: 'coral', label: 'Coral' },
  { value: 'echo', label: 'Echo' },
  { value: 'fable', label: 'Fable' },
  { value: 'nova', label: 'Nova' },
  { value: 'onyx', label: 'Onyx' },
  { value: 'sage', label: 'Sage' },
  { value: 'shimmer', label: 'Shimmer' }
] as const;

type TTSVoice = typeof TTS_VOICES[number]['value'];

// Welcome message constants
const WELCOME_MESSAGE_WITH_TEXT_INPUT = `Hello! I'm your health assistant. How can I help you today? 
I can answer health questions, help with appointments and show your risks.`; 

const WELCOME_MESSAGE_VOICE_ONLY = `Hello! I'm your health assistant. How can I help you today? 
I can answer health questions, help with appointments, show your scheduled appointments, 
and even navigate you to different sections of the app. 
Just tap the microphone and start speaking!`;

const VoiceModePage: React.FC = () => {
  const navigate = useNavigate();
  const [showChatOverlay, setShowChatOverlay] = useState(false);
  const [chatMessages, setChatMessages] = useState<(Message | AppointmentMessage | RiskProfileMessage)[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [textInput, setTextInput] = useState("");
  const [activeAgent, setActiveAgent] = useState<AgentType>('main');
  const [appointmentData, setAppointmentData] = useState<AppointmentData>({});
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isLongModeEnabled, setIsLongModeEnabled] = useState(false);
  const [selectedTtsVoice, setSelectedTtsVoice] = useState<TTSVoice>('shimmer');
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

    // Check if the response contains risk profile viewing instructions
    if (lowercaseResponse.includes('[show_risk_profile]')) {
      // Add risk profile to chat after a short delay
      setTimeout(() => {
        displayRiskProfileInChat();
      }, 500);
      
      // Return the response without the risk profile command
      return aiResponse.replace(/\[show_risk_profile\]/gi, '').trim();
    }

    // Check if the response contains agent handoff instructions
    if (lowercaseResponse.includes('[handoff_to_scheduler]')) {
      // Switch to appointment scheduling agent
      setTimeout(() => {
        setActiveAgent('appointment_scheduler');
        setAppointmentData({});
        
        const handoffMessage: Message = {
          id: Date.now().toString(),
          content: "I'll help you schedule a new appointment. Let's start by getting some information. What type of appointment would you like to schedule? (e.g., Cardiologist, General checkup, etc.)",
          role: 'assistant',
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, handoffMessage]);
        
        // Read the handoff message aloud
        textToSpeech(handoffMessage.content);
      }, 500);
      
      // Return the response without the handoff command
      return aiResponse.replace(/\[handoff_to_scheduler\]/gi, '').trim();
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

    // Create text version for AI conversation history
    let appointmentTextForAI = "Here are your upcoming appointments:\n\n";
    sortedAppointments.forEach((appointment, index) => {
      appointmentTextForAI += `${index + 1}. ${appointment.specialty} with ${appointment.doctor}\n`;
      appointmentTextForAI += `   Date: ${formatAppointmentDate(appointment.date)} at ${formatTime(appointment.time)}\n`;
      if (appointment.location) {
        appointmentTextForAI += `   Location: ${appointment.location}\n`;
      }
      appointmentTextForAI += "\n";
    });

    // Create appointment message with visual data
    const appointmentsMessage: AppointmentMessage = {
      id: Date.now().toString(),
      content: appointmentTextForAI.trim(), // This is what AI sees in conversation history
      role: 'assistant',
      timestamp: new Date(),
      type: 'appointment',
      appointments: sortedAppointments
    };
    setChatMessages(prev => [...prev, appointmentsMessage]);
  };

  // Function to display risk profile in chat
  const displayRiskProfileInChat = () => {
    // Create risk profile message with the widget component
    const riskProfileMessage: RiskProfileMessage = {
      id: Date.now().toString(),
      content: "Here is your cardiovascular risk profile with interactive controls:",
      role: 'assistant',
      timestamp: new Date(),
      type: 'risk_profile'
    };
    setChatMessages(prev => [...prev, riskProfileMessage]);
    
    // If TTS is enabled, provide an audio explanation of the risk profile
    if (isTtsEnabled) {
      // Wait longer to ensure the previous TTS message completes before starting explanation
      setTimeout(() => {
        // Check if TTS is still playing and wait if needed
        const checkAndPlayExplanation = () => {
          if (!isPlaying) {
            // Calculate current risk using the same logic as RiskProfileWidget
            // Default values: smoking=0 (0! cigarettes), activity=6 (10-30 minutes)
            const baseRisk = 10;
            const defaultSmokingValue = 0; // First option: "0!" cigarettes
            const defaultActivityValue = 6; // Third option: "10-30 minutes"
            const currentRisk = Math.min(100, baseRisk + defaultSmokingValue + defaultActivityValue);
            
            const shortRiskExplanation = `Your current overall risk level is ${currentRisk} percent.
            Would you like to know more about the factors contributing to your risk?`;
            
            const longRiskExplanation = `Your current overall risk level is ${currentRisk} percent. 
            the display shows a grid of faces - green smiling faces represent lower risk areas, while red frowning faces indicate higher risk areas. 
            you can interact with the smoking and exercise controls below to see how lifestyle changes affect your risk. 
            reducing smoking and increasing physical activity can improve your cardiovascular health and lower your risk profile.`;
            
            const riskExplanation = isLongModeEnabled ? longRiskExplanation : shortRiskExplanation;
            
            textToSpeech(riskExplanation);
          } else {
            // If still playing, wait another 500ms and check again
            setTimeout(checkAndPlayExplanation, 200);
          }
        };
        
        checkAndPlayExplanation();
      }, 2000); // Increased delay to give more time for the widget message to complete
    }
  };

  const callLLM = async (userMessage: string, conversationHistory: Message[]): Promise<string> => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your environment variables.');
    }

    const mainAgentPrompt = `You are a helpful health assistant for a cardiac monitoring app called Cardio Twin. You help users with general health questions, appointment scheduling, medication reminders, and cardiac health guidance. 

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

IMPORTANT: You can also show users their cardiovascular risk profile. When a user asks to see their risk profile, cardiovascular risk, health risks, or asks "what is my risk profile", include this command in your response: [show_risk_profile]

Examples of risk profile viewing responses:
- "Let me show you your cardiovascular risk profile. [show_risk_profile]"
- "Here is your current risk assessment. [show_risk_profile]"
- "I'll display your health risk profile for you. [show_risk_profile]"

IMPORTANT: When a user wants to schedule a NEW appointment, book an appointment, or create an appointment, you should hand off to the appointment scheduling specialist. Use this command: [handoff_to_scheduler]

Examples of scheduling handoff responses:
- "I'll help you schedule a new appointment. Let me connect you with our appointment scheduling specialist. [handoff_to_scheduler]"
- "Let me transfer you to our scheduling agent to book that appointment. [handoff_to_scheduler]"

Keep responses concise and friendly. If users ask about serious symptoms, advise them to contact their healthcare provider immediately. You can help with:
- General health questions
- Appointment scheduling guidance
- Medication reminders
- Cardiac health tips
- Lifestyle recommendations
- Emergency guidance
- Navigation between app sections
- Viewing current appointments
- Viewing cardiovascular risk profile
- Handoff to appointment scheduling

Always be supportive and professional in your responses.`;

    const schedulingAgentPrompt = `You are a specialized appointment scheduling agent for a healthcare app. Your job is to help users schedule medical appointments by gathering the necessary information: appointment type, date, time, doctor, and location.

You have access to the full conversation history, so you can reference previous messages and build upon the information already gathered.

Current appointment data gathered so far:
${Object.entries(appointmentData).map(([key, value]) => `${key}: ${value || 'Not provided'}`).join('\n')}

ALL of your responses must contain only valid JSON (no extra characters or delimiters). You must respond with valid JSON in this exact format:
{
  "status": "complete"|"asking"|"unsupported",
  "response": "<your message to the user>",
  "specialty": "<specialty>"|null,
  "doctor": "<doctor name>"|null,
  "time": "HH:MM"|null,
  "date": "YYYY-MM-DD"|null,
  "location": "<location>"|null
}

Rules:
- Be concise and conversational
- Use "asking" status when you need more information from the user
- If a user doesn't know the value for a specific field, use "TBD" for that field
- If a user enters an invalid value for a field three times, skip that field and use "TBD"
- Use "complete" status only when you have all required info: specialty, doctor, date, time, and location
- Use "unsupported" status for non-appointment related requests
- For "complete" status, include time in 24-hour format (e.g., "14:30" for 2:30 PM)
- For "complete" status, convert date to YYYY-MM-DD format
- Parse natural language dates like "tomorrow", "January 15", "next Monday"
- Parse natural language times like "2 PM", "morning", "afternoon"
- Be conversational and helpful in your responses
- Remember information from previous messages in the conversation
- Ask for one piece of missing information at a time
- If a user provides multiple pieces of information at once, acknowledge all of them
- Your responses must only contain valid JSON with the above format

Context: You are actively scheduling an appointment. Stay focused on gathering the missing appointment details.`;

    const systemPrompt = activeAgent === 'main' ? mainAgentPrompt : schedulingAgentPrompt;

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
      
      // If we're in scheduling mode, try to parse JSON response
      if (activeAgent === 'appointment_scheduler') {
        try {
          const schedulingResponse: SchedulingResponse = JSON.parse(aiResponse);
          
          // Update appointment data with any new information
          const updatedData = { ...appointmentData };
          if (schedulingResponse.specialty) updatedData.specialty = schedulingResponse.specialty;
          if (schedulingResponse.doctor) updatedData.doctor = schedulingResponse.doctor;
          if (schedulingResponse.date) updatedData.date = schedulingResponse.date;
          if (schedulingResponse.time) updatedData.time = schedulingResponse.time;
          if (schedulingResponse.location) updatedData.location = schedulingResponse.location;
          setAppointmentData(updatedData);
          
          // Check if appointment is complete
          if (schedulingResponse.status === 'complete') {
            // Trigger appointment completion
            setTimeout(() => {
              const newAppointment = createAppointment(updatedData);
              setActiveAgent('main');
              setAppointmentData({});
              
              const completionMessage: Message = {
                id: Date.now().toString(),
                content: `Great! I've successfully scheduled your appointment with ${newAppointment.doctor} for ${formatAppointmentDate(newAppointment.date)} at ${formatTime(newAppointment.time)}. Is there anything else I can help you with?`,
                role: 'assistant',
                timestamp: new Date()
              };
              setChatMessages(prev => [...prev, completionMessage]);
              
              // Read the completion message aloud
              textToSpeech(completionMessage.content);
            }, 500);
          }
          
          return schedulingResponse.response;
        } catch (parseError) {
          console.warn('JSON parsing failed for scheduling response:', parseError);
          console.warn('Raw response:', aiResponse);
          // Return raw response as fallback
          return aiResponse;
        }
      }
      
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

  const textToSpeech = async (text: string): Promise<void> => {
    if (!isTtsEnabled || !text.trim()) return;

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('OpenAI API key not configured for text-to-speech.');
      return;
    }

    try {
      // Stop any currently playing audio
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }

      setIsPlaying(true);

      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });

      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: selectedTtsVoice,
        input: text,
        speed: 1.0
      });

      const audioBuffer = await mp3.arrayBuffer();
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      setCurrentAudio(audio);

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        console.error('Error playing TTS audio');
        setIsPlaying(false);
        setCurrentAudio(null);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('Text-to-speech error:', error);
      setIsPlaying(false);
      setCurrentAudio(null);
    }
  };

  const stopTtsPlayback = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
      setIsPlaying(false);
    }
  };

  const startVoiceRecording = async () => {
    // Prevent recording while TTS is playing
    if (isPlaying) {
      alert('Please wait for the current speech to finish before recording.');
      return;
    }
    
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
        // Convert mixed messages to regular messages for AI conversation history
        const conversationForAI = chatMessages.map(msg => {
          if ((msg as AppointmentMessage).type === 'appointment') {
            return {
              id: msg.id,
              content: msg.content, // This will be the text version for appointment messages
              role: msg.role,
              timestamp: msg.timestamp
            } as Message;
          } else if ((msg as RiskProfileMessage).type === 'risk_profile') {
            return {
              id: msg.id,
              content: msg.content, // This will be the text version for risk profile messages
              role: msg.role,
              timestamp: msg.timestamp
            } as Message;
          } else {
            return msg as Message;
          }
        });
        
        const aiResponse = await callLLM(messageText.trim(), conversationForAI);
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: aiResponse,
          role: 'assistant',
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, botMessage]);
        
        // Read the response aloud using TTS
        if (aiResponse.trim()) {
          await textToSpeech(aiResponse);
        }
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
          ? WELCOME_MESSAGE_WITH_TEXT_INPUT
          : WELCOME_MESSAGE_VOICE_ONLY,
        role: 'assistant',
        timestamp: new Date()
      }]);
      
      // Read welcome message aloud
      if (isTtsEnabled) {
        const welcomeMessage = ENABLE_TEXT_INPUT 
          ? WELCOME_MESSAGE_WITH_TEXT_INPUT
          : WELCOME_MESSAGE_VOICE_ONLY;
        textToSpeech(welcomeMessage);
      }
    } else {
      if (isProcessing || isPlaying) return;
      
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
    setActiveAgent('main');
    setAppointmentData({});
    
    // Clean up audio
    stopTtsPlayback();
    
    if (isRecording) {
      stopVoiceRecording();
    }
  };

  // Function to create a new appointment
  const createAppointment = (appointmentData: AppointmentData) => {
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      doctor: appointmentData.doctor || 'TBD',
      specialty: appointmentData.specialty || 'General',
      date: appointmentData.date || getDatePlusDays(7), // Default to next week
      time: appointmentData.time || '10:00',
      location: appointmentData.location || 'TBD'
    };
    
    setAppointments(prev => [...prev, newAppointment]);
    return newAppointment;
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
        <div className="fixed inset-0 bg-white bg-opacity-90 flex flex-col justify-between z-50 p-4">
          {/* Close Button */}
          <div className="flex justify-between items-center">
            <div className="text-gray-800">
              <span className="text-sm opacity-75">Active Agent:</span>
              <span className={`ml-2 px-2 py-1 rounded text-sm font-medium ${
                activeAgent === 'main' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-orange-500 text-white'
              }`}>
                {activeAgent === 'main' ? '🏥 Health Assistant' : '📅 Appointment Scheduler'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* TTS Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTtsEnabled(!isTtsEnabled)}
                  className={`p-2 rounded-full transition-colors ${
                    isTtsEnabled 
                      ? 'bg-green-500 text-white hover:bg-green-600' 
                      : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                  }`}
                  title={isTtsEnabled ? 'Disable Text-to-Speech' : 'Enable Text-to-Speech'}
                >
                  {isTtsEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                </button>
                <button
                  onClick={() => setIsLongModeEnabled(!isLongModeEnabled)}
                  className={`p-2 rounded-full transition-colors ${
                    isLongModeEnabled 
                      ? 'bg-blue-500 text-white hover:bg-blue-600' 
                      : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                  }`}
                  title={isLongModeEnabled ? 'Disable Long Explanations' : 'Enable Long Explanations'}
                >
                  <Info className="h-5 w-5" />
                </button>
                {/* Voice Selection Dropdown */}
                <div className="flex items-center gap-2 bg-white bg-opacity-90 px-3 py-1 rounded-full border border-gray-300">
                  <label htmlFor="voice-select-overlay" className="text-xs font-medium text-gray-700">
                    Voice:
                  </label>
                  <select
                    id="voice-select-overlay"
                    value={selectedTtsVoice}
                    onChange={(e) => setSelectedTtsVoice(e.target.value as TTSVoice)}
                    className="text-xs bg-transparent border-none outline-none text-gray-700 pr-4"
                  >
                    {TTS_VOICES.map((voice) => (
                      <option key={voice.value} value={voice.value}>
                        {voice.label}
                      </option>
                    ))}
                  </select>
                </div>
                {isPlaying && (
                  <button
                    onClick={stopTtsPlayback}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 animate-pulse"
                    title="Stop current speech"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              <button
                onClick={closeChatOverlay}
                className="text-gray-800 hover:text-gray-600 p-2 rounded-full bg-gray-200 bg-opacity-50"
              >
                <X className="h-8 w-8" />
              </button>
            </div>
          </div>
          
          {/* Messages Area */}
          <div 
            ref={chatMessagesRef}
            className="flex-1 overflow-y-auto px-4 py-8 scroll-smooth max-w-4xl mx-auto w-full"
          >
            {chatMessages.map((message, index) => {
              // Check if this is an appointment message
              const isAppointmentMessage = (message as AppointmentMessage).type === 'appointment';
              const isRiskProfileMessage = (message as RiskProfileMessage).type === 'risk_profile';
              
              if (isAppointmentMessage) {
                const appointmentMessage = message as AppointmentMessage;
                return (
                  <div key={index} className="mb-6 text-left">
                    <div className="space-y-4">
                      {appointmentMessage.appointments.map((appointment) => (
                        <div 
                          key={appointment.id} 
                          className="flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 bg-white hover:border-heart transition-colors"
                        >
                          <div className="bg-teal-100 p-3 rounded-full">
                            <Stethoscope className="h-6 w-6 text-teal-500" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-800">
                              Appointment with {appointment.specialty}
                            </h3>
                            <p className="text-lg text-gray-600 font-bold underline">
                              {formatAppointmentDate(appointment.date)} at {formatTime(appointment.time)}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-base text-gray-500">
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
                  </div>
                );
              } else if (isRiskProfileMessage) {
                return (
                  <div key={index} className="mb-6 text-left">
                    <RiskProfileWidget />
                  </div>
                );
              } else {
                // Regular text message
                return (
                  <div key={index} className={`mb-6 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div
                      className={`inline-block max-w-xs lg:max-w-md px-4 py-3 rounded-lg border-gray-600 ${
                        message.role === 'user'
                          ? 'bg-blue-100 text-gray-800'
                          : 'bg-black bg-opacity-80 text-white'
                      }`}
                    >
                      <p className="text-2xl" style={{ fontSize: '26px' }}>{message.content}</p>
                    </div>
                  </div>
                );
              }
            })}
            
            {isProcessing && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
                <p className="text-gray-800 text-base mt-2">Processing your message...</p>
              </div>
            )}
          </div>
          
          {/* Text Input Area */}
          {ENABLE_TEXT_INPUT && (
            <div className="px-4 py-2 max-w-4xl mx-auto w-full ">
              <div className="flex items-center space-x-2 bg-white bg-opacity-90 rounded-lg p-2 border-4 border-gray-300">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  disabled={isProcessing}
                  className="flex-1 px-3 py-2 bg-transparent  outline-none text-gray-800 placeholder-gray-500 rounded"
                />
                <button
                  onClick={sendTextMessage}
                  disabled={!textInput.trim() || isProcessing}
                  className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  <Send className="h-5 w-5 text-white" />
                </button>
              </div>
              <p className="text-center text-gray-800 text-sm mt-2 opacity-75">
                Type your message or use voice below
              </p>
            </div>
          )}
          
          {/* Voice Control */}
          <div className="flex flex-col items-center py-4">
            <button
              onClick={() => {
                if (isProcessing || isPlaying) return;
                if (isRecording) {
                  stopVoiceRecording();
                } else {
                  startVoiceRecording();
                }
              }}
              disabled={isProcessing || isPlaying}
              className={`rounded-full p-6 text-white transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-2xl' 
                  : isPlaying
                    ? 'bg-orange-500 shadow-2xl'
                    : 'bg-blue-500 hover:bg-blue-600 shadow-2xl'
              }`}
              title={
                isProcessing 
                  ? "Processing..." 
                  : isPlaying
                    ? "Speaking... Please wait"
                    : isRecording 
                      ? "Stop recording" 
                      : "Start recording"
              }
            >
              <Mic className="h-10 w-10" />
            </button>
            <p className="text-center text-gray-800 text-lg mt-4 font-medium">
              {isProcessing 
                ? "Processing your message..." 
                : isPlaying
                  ? "Speaking... Please wait"
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