import React, { useState } from "react";
import { Smile, Frown } from "lucide-react";
import { Tooltip as ReactTooltip } from 'react-tooltip';
import RiskFactorsSection, { smokingOptions, activityOptions, RiskOption } from './RiskFactorsSection';

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
      
      <RiskFactorsSection
        selectedSmoking={selectedSmoking}
        selectedActivity={selectedActivity}
        onSmokingChange={setSelectedSmoking}
        onActivityChange={setSelectedActivity}
      />
    </div>
  );
};

export default RiskProfileWidget; 