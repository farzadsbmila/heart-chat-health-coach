
import React from "react";
import FixedSectionContainer from "./FixedSectionContainer";
import { Card, CardContent } from "@/components/ui/card";

const RecommendationsSection: React.FC = () => {
  return (
    <FixedSectionContainer>
      <h2 className="text-2xl font-bold text-heart-dark mb-4">Your Health Recommendations</h2>
      
      {/* Recommendations Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="border-l-4 border-l-heart">
          <CardContent className="p-4">
            <h3 className="text-xl font-semibold mb-2">Reduce Smoking</h3>
            <p className="text-lg">Try reducing your cigarette consumption by <span className="font-bold">1 cigarette per day</span>.</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-heart">
          <CardContent className="p-4">
            <h3 className="text-xl font-semibold mb-2">Increase Physical Activity</h3>
            <p className="text-lg">Add a <span className="font-bold">10-minute walk</span> to your daily routine.</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="p-4 bg-heart bg-opacity-10 rounded-lg">
        <p className="text-lg mb-3">Would you like to know how these recommendations can improve your health?</p>
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 bg-heart text-white rounded-lg hover:bg-heart-dark transition-colors">
            Smoking Reduction
          </button>
          <button className="px-4 py-2 bg-heart text-white rounded-lg hover:bg-heart-dark transition-colors">
            Walking Benefits
          </button>
        </div>
      </div>
    </FixedSectionContainer>
  );
};

export default RecommendationsSection;
