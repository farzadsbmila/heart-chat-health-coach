import React from "react";
import { Link } from "react-router-dom";
import { MessageCircle, BarChart, ListChecks, Activity, Home as HomeIcon, Info, Calendar } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const sections = [
  {
    name: "Chat",
    path: "/chat",
    icon: <MessageCircle className="h-12 w-12 mb-4 text-heart-dark" />,
    color: "bg-blue-100 hover:bg-blue-200 border-blue-300"
  },
  {
    name: "Risk Profile",
    path: "/risk-profile",
    icon: <BarChart className="h-12 w-12 mb-4 text-heart-dark" />,
    color: "bg-red-100 hover:bg-red-200 border-red-300"
  },
  {
    name: "Recommendations",
    path: "/recommendations",
    icon: <ListChecks className="h-12 w-12 mb-4 text-heart-dark" />,
    color: "bg-green-100 hover:bg-green-200 border-green-300"
  },
  {
    name: "Calendar",
    path: "/calendar",
    icon: <Calendar className="h-12 w-12 mb-4 text-heart-dark" />,
    color: "bg-purple-100 hover:bg-purple-200 border-purple-300"
  },
  {
    name: "Coaching",
    path: "/coaching",
    icon: <Activity className="h-12 w-12 mb-4 text-heart-dark" />,
    color: "bg-yellow-100 hover:bg-yellow-200 border-yellow-300"
  }
];

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex items-center justify-center p-4 bg-blue-500 text-white">
        <HomeIcon className="h-6 w-6 mr-2" />
        <h1 className="text-xl font-bold">Home</h1>
      </div>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12">
        <h1 className="text-4xl font-bold mb-10 text-heart-dark">Cardio Twin</h1>
        <div className="w-full max-w-2xl px-4">
          <Link
            to="/alerts"
            className="flex items-center justify-center rounded-2xl border-4 shadow-lg transition-all duration-200 text-center p-4 text-2xl font-semibold bg-orange-500 text-white mb-8"
          >
            <Info className="h-6 w-6 mr-2" />
            Today's Alerts
          </Link>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {sections.map((section) => (
              <Link
                key={section.name}
                to={section.path}
                className={`flex flex-col items-center justify-center rounded-2xl border-4 shadow-lg transition-all duration-200 text-center p-8 text-2xl font-semibold ${section.color}`}
              >
                {section.icon}
                {section.name}
              </Link>
            ))}
          </div>
        </div>
        <BottomNav />
      </div>
    </div>
  );
};

export default HomePage; 