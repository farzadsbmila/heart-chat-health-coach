import React, { useState } from "react";
import { Smile, Frown, Heart } from "lucide-react";
import { Tooltip as ReactTooltip } from 'react-tooltip';

interface RiskOption {
  label: string;
  value: number; // Risk percentage contribution
}

const smokingOptions: RiskOption[] = [
  { label: "0!", value: 0 },
  { label: "0-1", value: 2 },
  { label: "1-2", value: 3 },
  { label: "2-3", value: 4 },
  { label: "3-5", value: 6 },
  { label: "5-10", value: 8 },
  { label: "10-20", value: 10 },
  { label: "> 20", value: 12 }
];

const activityOptions: RiskOption[] = [
  { label: "> 60 minutes", value: 0 },
  { label: "30-60 minutes", value: 3 },
  { label: "10-30 minutes", value: 6 },
  { label: "0-10 minutes", value: 8 },
  { label: "None", value: 10 }
];

const RiskProfileWidget: React.FC = () => {
  const [selectedSmoking, setSelectedSmoking] = useState(smokingOptions[0]); // 0! cigarettes default
  const [selectedActivity, setSelectedActivity] = useState(activityOptions[2]); // 10-30 minutes default
  
  // Risk calculation logic
  const calculateRisk = () => {
    const baseRisk = 10;
    return Math.min(100, baseRisk + selectedSmoking.value + selectedActivity.value);
  };

  const risk = calculateRisk();

  const GridWithTooltip = ({ risk }: { risk: number }) => (
    <>
      <div 
        className="inline-grid grid-cols-6 bg-gray-50 rounded-lg"
        style={{ gap: '3px' }}
        data-tooltip-id="risk-tooltip"
        data-tooltip-content={`Risk Level: ${risk}%`}
      >
        {Array.from({ length: 36 }).map((_, index) => (
          <div 
            key={index}
            className={`flex items-center justify-center transition-colors duration-300 ${
              index >= (36 - Math.floor(36 * (risk/100))) ? 'text-red-500' : 'text-green-500'
            }`}
            style={{ lineHeight: 0 }}
          >
            {index >= (36 - Math.floor(36 * (risk/100))) ? (
              <Frown className="h-[60px] w-[60px]" />
            ) : (
              <Smile className="h-[60px] w-[60px]" />
            )}
          </div>
        ))}
      </div>
      <ReactTooltip
        id="risk-tooltip"
        place="top"
        float={true}
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          color: "#fff",
          padding: "10px 20px",
          borderRadius: "6px",
          fontSize: "16px",
          fontWeight: "500"
        }}
      />
    </>
  );

  const RiskFactorsSection = () => {
    // Helper function to get heart color based on index and total options
    const getHeartColor = (index: number, total: number) => {
      const opacity = 1 - (index / (total - 1));
      return `rgba(239, 68, 68, ${opacity})`; // Using red-500 color with opacity
    };

    return (
      <div className="space-y-6 mb-6">
        <h3 className="text-xl font-semibold">Adjust Risk Factors</h3>
        
        {/* Smoking Options */}
        <div className="space-y-2">
          <label className="block text-lg font-medium mb-2">
            Cigarettes per day
          </label>
          <div className="flex flex-wrap gap-2">
            {smokingOptions.map((option, index) => (
              <button
                key={option.label}
                onClick={() => setSelectedSmoking(option)}
                className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                  selectedSmoking.label === option.label
                    ? 'bg-white border-heart border-[3px]'
                    : 'border-gray-300 hover:border-heart'
                }`}
              >
                <Heart 
                  className={`h-5 w-5 ${
                    selectedSmoking.label === option.label ? 'fill-current' : ''
                  }`}
                  style={{ 
                    color: getHeartColor(index, smokingOptions.length) 
                  }}
                />
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Physical Activity Options */}
        <div className="space-y-2">
          <label className="block text-lg font-medium mb-2">
            Daily exercise
          </label>
          <div className="flex flex-wrap gap-2">
            {activityOptions.map((option, index) => (
              <button
                key={option.label}
                onClick={() => setSelectedActivity(option)}
                className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                  selectedActivity.label === option.label
                    ? 'bg-white border-heart border-[3px]'
                    : 'border-gray-300 hover:border-heart'
                }`}
              >
                <Heart 
                  className={`h-5 w-5 ${
                    selectedActivity.label === option.label ? 'fill-current' : ''
                  }`}
                  style={{ 
                    color: getHeartColor(index, activityOptions.length) 
                  }}
                />
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-heart transition-colors">
      <h2 className="text-2xl font-bold text-heart-dark mb-6">Your Cardiovascular Risk Profile</h2>
      
      {/* Current Risk Profile Grid */}
      <div className="flex flex-col items-center mb-6">
        <GridWithTooltip risk={risk} />
        <div className="text-lg font-medium text-gray-700 mt-2">
          Risk: {risk}%
        </div>
      </div>
      
      <RiskFactorsSection />
    </div>
  );
};

export default RiskProfileWidget; 