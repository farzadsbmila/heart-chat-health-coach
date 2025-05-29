import React from "react";
import { Heart } from "lucide-react";

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

interface RiskFactorsSectionProps {
  selectedSmoking: RiskOption;
  selectedActivity: RiskOption;
  onSmokingChange: (option: RiskOption) => void;
  onActivityChange: (option: RiskOption) => void;
}

const RiskFactorsSection: React.FC<RiskFactorsSectionProps> = ({
  selectedSmoking,
  selectedActivity,
  onSmokingChange,
  onActivityChange,
}) => {
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
              onClick={() => onSmokingChange(option)}
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
              onClick={() => onActivityChange(option)}
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

export default RiskFactorsSection;
export { smokingOptions, activityOptions };
export type { RiskOption }; 