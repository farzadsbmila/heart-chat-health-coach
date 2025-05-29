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
import { Smile, Frown, TrendingUp, Heart } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tooltip as ReactTooltip } from 'react-tooltip';
import BottomNav from "@/components/BottomNav";
import HomeButton from "@/components/HomeButton";
import RiskFactorsSection, { smokingOptions, activityOptions, RiskOption } from './RiskFactorsSection';

const riskData = [
  { month: 'March', risk: 75 },
  { month: 'April', risk: 65 },
  { month: 'May', risk: 58 }
];

// Add new interface and data for cardiovascular diseases
interface CardiovascularRisk {
  disease: string;
  risk: number;
  description?: string;
}

const cardiovascularRisks: CardiovascularRisk[] = [
  { disease: "Heart Attack", risk: 15 },
  { disease: "Angina", risk: 10 },
  { disease: "Ischemic Heart Disease", risk: 25 },
  { disease: "Atrial Fibrillation", risk: 10 }
];

// Risk factor multipliers for each disease (1, 2, or 3)
const RISK_MULTIPLIERS = {
  heartAttack: {
    smoking: 3,
    activity: 2
  },
  angina: {
    smoking: 2,
    activity: 1
  },
  ischemicHeart: {
    smoking: 1,
    activity: 3
  },
  atrialFibrillation: {
    smoking: 2,
    activity: 2
  }
};

const RiskProfileSection: React.FC = () => {
  const [showProgress, setShowProgress] = useState(false);
  const [showEasyProgress, setShowEasyProgress] = useState(false);
  const [showDetailedRisks, setShowDetailedRisks] = useState(false);
  const [showChartView, setShowChartView] = useState(false);
  const [selectedSmoking, setSelectedSmoking] = useState(smokingOptions[0]); // 0! cigarettes default
  const [selectedActivity, setSelectedActivity] = useState(activityOptions[2]); // 10-30 minutes default
  
  // Update risk calculation to use multipliers
  const calculateRisks = () => {
    const baseRisk = {
      total: 10,
      heartAttack: 15,
      angina: 10,
      ischemicHeart: 25,
      atrialFibrillation: 10
    };

    return {
      total: Math.min(100, baseRisk.total + selectedSmoking.value + selectedActivity.value),
      heartAttack: Math.min(100, baseRisk.heartAttack + 
        (selectedSmoking.value * RISK_MULTIPLIERS.heartAttack.smoking) + 
        (selectedActivity.value * RISK_MULTIPLIERS.heartAttack.activity)),
      angina: Math.min(100, baseRisk.angina + 
        (selectedSmoking.value * RISK_MULTIPLIERS.angina.smoking) + 
        (selectedActivity.value * RISK_MULTIPLIERS.angina.activity)),
      ischemicHeart: Math.min(100, baseRisk.ischemicHeart + 
        (selectedSmoking.value * RISK_MULTIPLIERS.ischemicHeart.smoking) + 
        (selectedActivity.value * RISK_MULTIPLIERS.ischemicHeart.activity)),
      atrialFibrillation: Math.min(100, baseRisk.atrialFibrillation + 
        (selectedSmoking.value * RISK_MULTIPLIERS.atrialFibrillation.smoking) + 
        (selectedActivity.value * RISK_MULTIPLIERS.atrialFibrillation.activity))
    };
  };

  const risks = calculateRisks();

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
    <div className="min-h-screen flex flex-col">
      <HomeButton />
      <FixedSectionContainer>
        <div className="space-y-4 mb-4">
          <h2 className="text-2xl font-bold text-heart-dark">Your Cardiovascular Risk Profile</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setShowProgress(!showProgress);
                setShowEasyProgress(false);
                setShowDetailedRisks(false);
                setShowChartView(false);
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
                setShowDetailedRisks(false);
                setShowChartView(false);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-heart text-white rounded-lg hover:bg-heart-dark transition-colors"
            >
              {showEasyProgress ? "Hide Easy Progress" : "Show Easy Progress"}
            </button>
            <button 
              onClick={() => {
                setShowDetailedRisks(!showDetailedRisks);
                setShowProgress(false);
                setShowEasyProgress(false);
                setShowChartView(false);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-heart text-white rounded-lg hover:bg-heart-dark transition-colors"
            >
              {showDetailedRisks ? "Hide Detailed Risks" : "Show Detailed Risks"}
            </button>
            <button 
              onClick={() => {
                setShowChartView(!showChartView);
                setShowProgress(false);
                setShowEasyProgress(false);
                setShowDetailedRisks(false);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-heart text-white rounded-lg hover:bg-heart-dark transition-colors"
            >
              {showChartView ? "Hide Chart View" : "Show Chart View"}
            </button>
          </div>
        </div>

        {/* Current Risk Profile Grid */}
        {!showProgress && !showEasyProgress && !showDetailedRisks && !showChartView && (
          <>
            <div className="flex flex-col items-center mb-6">
              <GridWithTooltip risk={risks.total} />
              <div className="text-lg font-medium text-gray-700 mt-2">
                Risk: {risks.total}%
              </div>
            </div>
            <RiskFactorsSection 
              selectedSmoking={selectedSmoking}
              selectedActivity={selectedActivity}
              onSmokingChange={setSelectedSmoking}
              onActivityChange={setSelectedActivity}
            />
          </>
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

        {/* Detailed Cardiovascular Risks */}
        {showDetailedRisks && (
          <>
            <div className="grid grid-cols-2 gap-8 mb-4">
              <div className="flex flex-col items-center">
                <h3 className="text-xl font-semibold text-heart-dark mb-4">
                  Heart Attack
                </h3>
                <GridWithTooltip risk={risks.heartAttack} />
                <div className="text-lg font-medium text-gray-700 mt-2">
                  Risk: {risks.heartAttack}%
                </div>
              </div>
              <div className="flex flex-col items-center">
                <h3 className="text-xl font-semibold text-heart-dark mb-4">
                  Angina
                </h3>
                <GridWithTooltip risk={risks.angina} />
                <div className="text-lg font-medium text-gray-700 mt-2">
                  Risk: {risks.angina}%
                </div>
              </div>
              <div className="flex flex-col items-center">
                <h3 className="text-xl font-semibold text-heart-dark mb-4">
                  Ischemic Heart Disease
                </h3>
                <GridWithTooltip risk={risks.ischemicHeart} />
                <div className="text-lg font-medium text-gray-700 mt-2">
                  Risk: {risks.ischemicHeart}%
                </div>
              </div>
              <div className="flex flex-col items-center">
                <h3 className="text-xl font-semibold text-heart-dark mb-4">
                  Atrial Fibrillation
                </h3>
                <GridWithTooltip risk={risks.atrialFibrillation} />
                <div className="text-lg font-medium text-gray-700 mt-2">
                  Risk: {risks.atrialFibrillation}%
                </div>
              </div>
            </div>
            <div className="text-center text-lg text-gray-600 mb-6">
              Detailed risk assessment for specific cardiovascular conditions
            </div>
            <RiskFactorsSection 
              selectedSmoking={selectedSmoking}
              selectedActivity={selectedActivity}
              onSmokingChange={setSelectedSmoking}
              onActivityChange={setSelectedActivity}
            />
          </>
        )}

        {/* Chart View for Detailed Risks */}
        {showChartView && (
          <>
            <div className="mb-6 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Heart Attack', risk: risks.heartAttack },
                  { name: 'Angina', risk: risks.angina },
                  { name: 'Ischemic Heart Disease', risk: risks.ischemicHeart },
                  { name: 'Atrial Fibrillation', risk: risks.atrialFibrillation }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <RechartsTooltip />
                  <Bar dataKey="risk" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center text-lg text-gray-600 mb-6">
              Detailed risk assessment chart for specific cardiovascular conditions
            </div>
            <RiskFactorsSection 
              selectedSmoking={selectedSmoking}
              selectedActivity={selectedActivity}
              onSmokingChange={setSelectedSmoking}
              onActivityChange={setSelectedActivity}
            />
          </>
        )}
      </FixedSectionContainer>
      <BottomNav />
    </div>
  );
};

export default RiskProfileSection;
