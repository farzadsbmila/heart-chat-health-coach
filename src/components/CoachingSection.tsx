import React from "react";
import FixedSectionContainer from "./FixedSectionContainer";
import { Smile, Frown } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const activityData = [
  { day: "Mon", completed: true },
  { day: "Tue", completed: false },
  { day: "Wed", completed: true },
  { day: "Thu", completed: true },
  { day: "Fri", completed: false },
  { day: "Sat", completed: true },
  { day: "Sun", completed: false },
];

const CoachingSection: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <FixedSectionContainer>
        <h2 className="text-2xl font-bold text-heart-dark mb-4">Your Activity Progress</h2>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">Walking 10 minutes/day - Past Week</h3>
          
          <div className="grid grid-cols-7 gap-2">
            {activityData.map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                  item.completed 
                    ? "bg-green-100 text-green-600 border border-green-200" 
                    : "bg-red-100 text-red-500 border border-red-200"
                }`}>
                  {item.completed ? 
                    <Smile className="h-8 w-8" /> : 
                    <Frown className="h-8 w-8" />
                  }
                </div>
                <span className="text-sm font-medium mt-1">{item.day}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 bg-heart bg-opacity-10 rounded-lg">
          <p className="text-lg font-medium mb-3">Have you completed your 10-minute walk today?</p>
          <div className="flex gap-2">
            <button className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
              Yes
            </button>
            <button className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
              Not yet
            </button>
          </div>
        </div>
      </FixedSectionContainer>
      <BottomNav />
    </div>
  );
};

export default CoachingSection;
