
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import FixedSectionContainer from "./FixedSectionContainer";
import { Frown } from "lucide-react";

const riskData = [
  { month: 'March', risk: 75 },
  { month: 'April', risk: 65 },
  { month: 'May', risk: 58 }
];

const RiskProfileSection: React.FC = () => {
  return (
    <FixedSectionContainer>
      <h2 className="text-2xl font-bold text-heart-dark mb-4">Your Cardiovascular Risk Profile</h2>
      
      {/* Risk Chart */}
      <div className="mb-6 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={riskData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="risk" fill="#9B87F5" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Risk Factors */}
      <div className="space-y-3 mb-6">
        <h3 className="text-xl font-semibold">Contributing Risk Factors</h3>
        
        <div className="flex items-center p-3 bg-red-50 rounded-lg border border-red-200">
          <Frown className="h-6 w-6 mr-3 text-red-500" />
          <span className="text-lg font-medium">Smoking: <span className="text-red-600 font-bold">high risk</span></span>
        </div>
        
        <div className="flex items-center p-3 bg-amber-50 rounded-lg border border-amber-200">
          <Frown className="h-6 w-6 mr-3 text-amber-500" />
          <span className="text-lg font-medium">Low physical activity: <span className="text-amber-600 font-bold">medium risk</span></span>
        </div>
      </div>
      
      <div className="p-4 bg-heart bg-opacity-10 rounded-lg">
        <p className="text-lg mb-3">Would you like to learn more about these contributing factors?</p>
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 bg-heart text-white rounded-lg hover:bg-heart-dark transition-colors">
            Smoking
          </button>
          <button className="px-4 py-2 bg-heart text-white rounded-lg hover:bg-heart-dark transition-colors">
            Physical Activity
          </button>
        </div>
      </div>
    </FixedSectionContainer>
  );
};

export default RiskProfileSection;
