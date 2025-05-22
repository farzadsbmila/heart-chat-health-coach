import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock, User } from "lucide-react";
import FixedSectionContainer from "@/components/FixedSectionContainer";
import HomeButton from "@/components/HomeButton";
import BottomNav from "@/components/BottomNav";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'appointment' | 'medication' | 'exercise';
}

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showNewEventForm, setShowNewEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '',
    type: 'appointment' as Event['type']
  });

  // Create dynamic date for cardiology appointment (3 days from now)
  const getDatePlusDays = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  const [events] = useState<Event[]>([
    {
      id: '1',
      title: 'Cardiology Appointment',
      date: getDatePlusDays(3),
      time: '10:00',
      type: 'appointment'
    },
    {
      id: '3',
      title: 'Morning Walk',
      date: new Date().toISOString().split('T')[0], // Today
      time: '08:00',
      type: 'exercise'
    },
    {
      id: '2',
      title: 'Take Athorvastatin',
      date: new Date().toISOString().split('T')[0], // Today
      time: '12:00',
      type: 'medication'
    },
    {
      id: '4',
      title: 'Blood Pressure Check',
      date: getDatePlusDays(1), // Tomorrow
      time: '09:00',
      type: 'medication'
    },
    {
      id: '5',
      title: 'Evening Yoga',
      date: getDatePlusDays(2),
      time: '18:00',
      type: 'exercise'
    }
  ]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getEventsForDate = (dateString: string) => {
    return events.filter(event => event.date === dateString)
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const getEventTypeColor = (type: Event['type']) => {
    switch (type) {
      case 'appointment': return 'bg-blue-100 text-blue-800';
      case 'medication': return 'bg-green-100 text-green-800';
      case 'exercise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleScheduleForDate = () => {
    setShowNewEventForm(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <HomeButton />
      <FixedSectionContainer>
        <div className="space-y-4 mb-4">
          <h2 className="text-2xl font-bold text-heart-dark">Calendar</h2>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center font-medium text-gray-600">
                {day}
              </div>
            ))}
            
            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDayOfMonth }, (_, i) => (
              <div key={`empty-${i}`} className="p-2"></div>
            ))}
            
            {/* Days of the month */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dateString = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
              const dayEvents = getEventsForDate(dateString);
              const isToday = dateString === new Date().toISOString().split('T')[0];
              const hasEvents = dayEvents.length > 0;
              
              return (
                <div
                  key={day}
                  className={`p-2 min-h-[60px] border rounded-lg cursor-pointer hover:bg-gray-50 ${
                    isToday ? 'bg-blue-50 border-blue-200' : 
                    hasEvents ? 'bg-orange-50 border-orange-200' : 'border-gray-200'
                  }`}
                  onClick={() => {
                    setSelectedDate(dateString);
                    setShowNewEventForm(false);
                  }}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                    {day}
                  </div>
                  {dayEvents.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded mb-1 ${getEventTypeColor(event.type)}`}
                    >
                      {event.time} {event.title.length > 10 ? event.title.substring(0, 10) + '...' : event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Event Button - Only show when no date is selected */}
          {!selectedDate && (
            <button
              onClick={() => setShowNewEventForm(!showNewEventForm)}
              className="flex items-center gap-2 px-4 py-2 bg-heart text-white rounded-lg hover:bg-heart-dark transition-colors"
            >
              <Plus className="h-4 w-4" />
              Schedule New Event
            </button>
          )}

          {/* New Event Form - Only show when no date is selected */}
          {showNewEventForm && !selectedDate && (
            <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h4 className="text-lg font-medium mb-4">Schedule New Event</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Event Title</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:border-heart focus:outline-none"
                    placeholder="Enter event title"
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
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:border-heart focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({...newEvent, type: e.target.value as Event['type']})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:border-heart focus:outline-none"
                  >
                    <option value="appointment">Appointment</option>
                    <option value="medication">Medication</option>
                    <option value="exercise">Exercise</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-heart text-white rounded-lg hover:bg-heart-dark transition-colors">
                    Save Event
                  </button>
                  <button
                    onClick={() => setShowNewEventForm(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Selected Date Events */}
          {selectedDate && (
            <div className="mt-6 p-4 border border-gray-200 rounded-lg">
              <h4 className="text-lg font-medium mb-4">
                Events for {new Date(selectedDate + 'T00:00:00').toLocaleDateString()}
              </h4>
              {getEventsForDate(selectedDate).length > 0 ? (
                <div className="space-y-2 mb-4">
                  {getEventsForDate(selectedDate).map(event => (
                    <div key={event.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      {event.type === 'appointment' && <User className="h-5 w-5 text-blue-500" />}
                      {event.type === 'medication' && <Clock className="h-5 w-5 text-green-500" />}
                      {event.type === 'exercise' && <Plus className="h-5 w-5 text-purple-500" />}
                      <div>
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm text-gray-600">{event.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 mb-4">No events scheduled for this date.</p>
              )}

              {/* Schedule New Event Button for Selected Date */}
              <button
                onClick={handleScheduleForDate}
                className="flex items-center gap-2 px-4 py-2 bg-heart text-white rounded-lg hover:bg-heart-dark transition-colors mb-4"
              >
                <Plus className="h-4 w-4" />
                Schedule Event for This Day
              </button>

              {/* New Event Form for Selected Date */}
              {showNewEventForm && (
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h5 className="text-md font-medium mb-4">
                    Schedule Event for {new Date(selectedDate + 'T00:00:00').toLocaleDateString()}
                  </h5>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Event Title</label>
                      <input
                        type="text"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:border-heart focus:outline-none"
                        placeholder="Enter event title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Time</label>
                      <input
                        type="time"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:border-heart focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Type</label>
                      <select
                        value={newEvent.type}
                        onChange={(e) => setNewEvent({...newEvent, type: e.target.value as Event['type']})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:border-heart focus:outline-none"
                      >
                        <option value="appointment">Appointment</option>
                        <option value="medication">Medication</option>
                        <option value="exercise">Exercise</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-heart text-white rounded-lg hover:bg-heart-dark transition-colors">
                        Save Event
                      </button>
                      <button
                        onClick={() => setShowNewEventForm(false)}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Back to Calendar Button */}
              <button
                onClick={() => {
                  setSelectedDate(null);
                  setShowNewEventForm(false);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Back to Calendar
              </button>
            </div>
          )}
        </div>
      </FixedSectionContainer>
      <BottomNav />
    </div>
  );
};

export default CalendarPage; 