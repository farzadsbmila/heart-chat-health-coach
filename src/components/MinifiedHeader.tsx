
import React from "react";
import { BarChart, ListChecks, Activity } from "lucide-react";
import { useChatContext } from "@/context/ChatContext";

interface MinifiedHeaderProps {
  scrollToTop: () => void;
}

const MinifiedHeader: React.FC<MinifiedHeaderProps> = ({ scrollToTop }) => {
  const { currentView } = useChatContext();
  
  // Different icons and labels based on the current view
  const getViewContent = () => {
    switch (currentView) {
      case "risk":
        return { 
          icon: <BarChart className="h-5 w-5 mr-2" />, 
          label: "Risk Profile" 
        };
      case "recommendations":
        return { 
          icon: <ListChecks className="h-5 w-5 mr-2" />, 
          label: "Recommendations" 
        };
      case "coaching":
        return { 
          icon: <Activity className="h-5 w-5 mr-2" />, 
          label: "Activity Tracking" 
        };
      default:
        return { icon: null, label: "" };
    }
  };

  const { icon, label } = getViewContent();

  if (currentView === "general") return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-heart-dark to-heart shadow-md cursor-pointer transform transition-all duration-300 ease-in-out animate-fade-in" 
      onClick={scrollToTop}
    >
      <div className="max-w-4xl mx-auto px-4 py-2">
        <div className="flex items-center text-white">
          {icon}
          <span className="font-medium">{label}</span>
        </div>
      </div>
    </div>
  );
};

export default MinifiedHeader;
