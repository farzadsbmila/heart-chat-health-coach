import React, { useState } from "react";
import { Pill, Clock, Check } from "lucide-react";
import FixedSectionContainer from "@/components/FixedSectionContainer";
import HomeButton from "@/components/HomeButton";
import BottomNav from "@/components/BottomNav";

const AlertsPage: React.FC = () => {
  const [checkedItems, setCheckedItems] = useState({
    athorvastatin: false,
    lisinopril: false
  });

  const toggleCheck = (item: 'athorvastatin' | 'lisinopril') => {
    setCheckedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <HomeButton />
      <FixedSectionContainer>
        <div className="space-y-4 mb-4">
          <h2 className="text-2xl font-bold text-heart-dark">Today's Alerts</h2>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div 
              className={`flex items-center gap-4 p-4 rounded-lg border-2 hover:border-heart transition-colors cursor-pointer ${
                checkedItems.athorvastatin 
                  ? 'bg-green-100 border-green-300' 
                  : 'border-gray-200'
              }`}
              onClick={() => toggleCheck('athorvastatin')}
            >
              <div className={`p-3 rounded-full ${checkedItems.athorvastatin ? 'bg-green-200' : 'bg-blue-100'}`}>
                {checkedItems.athorvastatin ? (
                  <Check className="h-6 w-6 text-green-600" />
                ) : (
                  <Pill className="h-6 w-6 text-blue-500" />
                )}
              </div>
              <span className={`text-lg ${checkedItems.athorvastatin ? 'line-through text-gray-600' : ''}`}>
                Take Athorvastatin (blue pill) at 12pm
              </span>
            </div>

            <div 
              className={`flex items-center gap-4 p-4 rounded-lg border-2 hover:border-heart transition-colors cursor-pointer ${
                checkedItems.lisinopril 
                  ? 'bg-green-100 border-green-300' 
                  : 'border-gray-200'
              }`}
              onClick={() => toggleCheck('lisinopril')}
            >
              <div className={`p-3 rounded-full ${checkedItems.lisinopril ? 'bg-green-200' : 'bg-blue-100'}`}>
                {checkedItems.lisinopril ? (
                  <Check className="h-6 w-6 text-green-600" />
                ) : (
                  <Pill className="h-6 w-6 text-blue-500" />
                )}
              </div>
              <span className={`text-lg ${checkedItems.lisinopril ? 'line-through text-gray-600' : ''}`}>
                Take Lisinopril (white capsule) after lunch
              </span>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-heart transition-colors">
              <div className="bg-blue-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
              <span className="text-lg">Appointment with Cardiologist, tomorrow 10am</span>
            </div>
          </div>
        </div>
      </FixedSectionContainer>
      <BottomNav />
    </div>
  );
};

export default AlertsPage; 