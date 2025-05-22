import React, { useState } from "react";
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

type ChatStep = 'start' | 'asking_purpose' | 'asking_datetime' | 'confirming_datetime' | 'asking_location' | 'confirming_location' | 'completed';

interface AppointmentData {
  purpose: string;
  date: string;
  time: string;
  location: string;
}

const AppointmentsPage: React.FC = () => {
  const [showNewAppointmentForm, setShowNewAppointmentForm] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatStep, setChatStep] = useState<ChatStep>('start');
  const [appointmentData, setAppointmentData] = useState<AppointmentData>({
    purpose: '',
    date: '',
    time: '',
    location: ''
  });

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

  const generateChatResponse = (userMessage: string, step: ChatStep): string => {
    switch (step) {
      case 'start':
        return "I will add an appointment to your calendar! What type of appointment would you like to schedule? For example, you could say 'Cardiology appointment' or 'Check-up with Dr. Smith'.";
      
      case 'asking_datetime':
        return "Great! Now, when would you like to schedule this appointment? Please tell me the date and time. For example, 'Tomorrow at 2:30 PM' or 'January 15th at 10:00 AM'.";
      
      case 'confirming_datetime':
        return `Perfect! I have you scheduled for ${appointmentData.purpose} on ${appointmentData.date} at ${formatTime(appointmentData.time)}. Is this correct?`;
      
      case 'asking_location':
        return "Excellent! Now, where will this appointment take place? Please provide the location, such as 'Heart Center, Room 205' or 'Main Hospital, 3rd Floor'.";
      
      case 'confirming_location':
        return `Thank you! Your appointment details are:\n\n• ${appointmentData.purpose}\n• ${formatAppointmentDate(appointmentData.date)} at ${formatTime(appointmentData.time)}\n• Location: ${appointmentData.location}\n\nShould I add this appointment to your schedule?`;
      
      default:
        return "I'm here to help you schedule appointments. How can I assist you today?";
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

  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: chatInput,
      role: 'user',
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);

    let nextStep: ChatStep = chatStep;
    let botResponse = '';

    switch (chatStep) {
      case 'start':
        setAppointmentData(prev => ({ ...prev, purpose: chatInput }));
        nextStep = 'asking_datetime';
        botResponse = generateChatResponse('', 'asking_datetime');
        break;

      case 'asking_datetime':
        const parsedDateTime = parseDateTime(chatInput);
        if (parsedDateTime) {
          setAppointmentData(prev => ({ 
            ...prev, 
            date: parsedDateTime.date, 
            time: parsedDateTime.time 
          }));
          nextStep = 'confirming_datetime';
          botResponse = generateChatResponse('', 'confirming_datetime');
        } else {
          botResponse = "I couldn't understand the date and time. Could you please try again? For example, 'Tomorrow at 2:30 PM' or 'January 15th at 10:00 AM'.";
        }
        break;

      case 'confirming_datetime':
        if (chatInput.toLowerCase().includes('yes') || chatInput.toLowerCase().includes('correct') || chatInput.toLowerCase().includes('right')) {
          nextStep = 'asking_location';
          botResponse = generateChatResponse('', 'asking_location');
        } else {
          nextStep = 'asking_datetime';
          botResponse = "Let's try again. When would you like to schedule this appointment?";
        }
        break;

      case 'asking_location':
        setAppointmentData(prev => ({ ...prev, location: chatInput }));
        nextStep = 'confirming_location';
        botResponse = generateChatResponse('', 'confirming_location');
        break;

      case 'confirming_location':
        if (chatInput.toLowerCase().includes('yes') || chatInput.toLowerCase().includes('add') || chatInput.toLowerCase().includes('schedule')) {
          // Add appointment to list
          const newAppointment: Appointment = {
            id: Date.now().toString(),
            doctor: appointmentData.purpose.includes('Dr.') ? appointmentData.purpose : 'TBD',
            specialty: appointmentData.purpose,
            date: appointmentData.date,
            time: appointmentData.time,
            location: appointmentData.location
          };

          setAppointments(prev => [...prev, newAppointment]);
          botResponse = "Perfect! Your appointment has been added to your schedule. The chat will now close automatically.";
          
          // Clear chat after a delay
          setTimeout(() => {
            setShowChat(false);
            setChatMessages([]);
            setChatStep('start');
            setAppointmentData({ purpose: '', date: '', time: '', location: '' });
          }, 2000);
        } else {
          nextStep = 'asking_location';
          botResponse = "Let's update the location. Where will this appointment take place?";
        }
        break;
    }

    setChatStep(nextStep);

    // Add bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        role: 'assistant',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botMessage]);
    }, 500);

    setChatInput('');
  };

  const startAppointmentChat = () => {
    setShowChat(true);
    setChatStep('start');
    setAppointmentData({ purpose: '', date: '', time: '', location: '' });
    
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content: generateChatResponse('', 'start'),
      role: 'assistant',
      timestamp: new Date()
    };
    
    setChatMessages([welcomeMessage]);
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
                  setChatStep('start');
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="h-64 overflow-y-auto p-4">
              {chatMessages.map((message, index) => (
                <ChatMessage key={index} message={message} />
              ))}
            </div>
            
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleChatSubmit()}
                  placeholder="Type your message..."
                  className="flex-1 rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={handleChatSubmit}
                  className="rounded-lg bg-blue-500 p-2 text-white hover:bg-blue-600"
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