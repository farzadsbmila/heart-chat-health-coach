import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip,
  ResponsiveContainer 
} from "recharts";
import FixedSectionContainer from "./FixedSectionContainer";
import { Smile, Frown, TrendingUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tooltip as ReactTooltip } from 'react-tooltip';

const riskData = [
  { month: 'March', risk: 75 },
  { month: 'April', risk: 65 },
  { month: 'May', risk: 58 }
];

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
  { label: "None", value: 10 },
  { label: "0-10 minutes", value: 8 },
  { label: "10-30 minutes", value: 6 },
  { label: "30-60 minutes", value: 3 },
  { label: "> 60 minutes", value: 0 }
];

const RiskProfileSection: React.FC = () => {
  const [showProgress, setShowProgress] = useState(false);
  const [showEasyProgress, setShowEasyProgress] = useState(false);
  const [selectedSmoking, setSelectedSmoking] = useState(smokingOptions[0]); // 0-1 cigarettes default
  const [selectedActivity, setSelectedActivity] = useState(activityOptions[2]); // 10-30 minutes default
  
  // Calculate total risk based on factors
  const calculateRisk = (): number => {
    // Base risk of 10% plus contributions from factors
    return Math.min(100, 10 + selectedSmoking.value + selectedActivity.value);
  };

  const totalRisk = calculateRisk();

  const monthlyRisks = [
    { month: 'March', risk: 10 },
    { month: 'April', risk: 9 },
    { month: 'May', risk: 7 }
  ];

  const GridWithTooltip = ({ risk }: { risk: number }) => (
    <>
      <div 
        className="inline-grid grid-cols-6 bg-gray-50 rounded-lg"
        style={{ gap: '3px' }}
        data-tooltip-id="risk-tooltip"
        data-tooltip-content={`Risk Level: ${Math.round((risk/36) * 100)}%`}
      >
        {Array.from({ length: 36 }).map((_, index) => (
          <div 
            key={index}
            className={`flex items-center justify-center transition-colors duration-300 ${
              index >= (36 - risk) ? 'text-red-500' : 'text-green-500'
            }`}
            style={{ lineHeight: 0 }}
          >
            {index >= (36 - risk) ? (
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
    <FixedSectionContainer>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-heart-dark">Your Cardiovascular Risk Profile</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              setShowProgress(!showProgress);
              setShowEasyProgress(false);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-heart text-white rounded-lg hover:bg-heart-dark transition-colors"
          >
            <TrendingUp className="h-4 w-4" />
            {showProgress ? "Hide Progress" : "Show Progress"}
          </button>
          <button 
            onClick={() => {
              setShowEasyProgress(!showEasyProgress);
              setShowProgress(false);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-heart text-white rounded-lg hover:bg-heart-dark transition-colors"
          >
            {showEasyProgress ? "Hide Easy Progress" : "Show Easy Progress"}
          </button>
        </div>
      </div>

      {/* Current Risk Profile Grid */}
      {!showProgress && !showEasyProgress && (
        <div className="flex justify-center mb-6">
          <GridWithTooltip risk={Math.floor(36 * (totalRisk/100))} />
        </div>
      )}

      {/* Original Progress Chart */}
      {showProgress && (
        <div className="mb-6 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={riskData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <RechartsTooltip />
              <Bar dataKey="risk" fill="#9B87F5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Easy Progress - Three 6x6 Smiley Grids */}
      {showEasyProgress && (
        <div>
          <div className="flex justify-center gap-16">
            {monthlyRisks.map((monthData) => (
              <div key={monthData.month} className="flex flex-col items-center">
                <GridWithTooltip risk={monthData.risk} />
                <div className="text-lg font-medium text-gray-700">{monthData.month}</div>
              </div>
            ))}
          </div>
          <div className="text-center text-lg text-gray-600">
            Your risk profile over the last three months
          </div>
        </div>
      )}

      {/* Interactive Risk Factors */}
      <div className="space-y-6 mb-6">
        <h3 className="text-xl font-semibold">Adjust Risk Factors</h3>
        
        {/* Smoking Options */}
        <div className="space-y-2">
          <label className="block text-lg font-medium mb-2">
            Cigarettes per day
          </label>
          <div className="flex flex-wrap gap-2">
            {smokingOptions.map((option) => (
              <button
                key={option.label}
                onClick={() => setSelectedSmoking(option)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  selectedSmoking.label === option.label
                    ? 'bg-heart text-white border-heart'
                    : 'border-gray-300 hover:border-heart'
                }`}
              >
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
            {activityOptions.map((option) => (
              <button
                key={option.label}
                onClick={() => setSelectedActivity(option)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  selectedActivity.label === option.label
                    ? 'bg-heart text-white border-heart'
                    : 'border-gray-300 hover:border-heart'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </FixedSectionContainer>
  );
};

export default RiskProfileSection;
