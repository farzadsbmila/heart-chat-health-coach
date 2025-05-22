import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, MessageCircle, BarChart, ListChecks, Activity } from "lucide-react";

const navItems = [
  { name: "Home", path: "/", icon: <Home className="h-6 w-6" /> },
  { name: "Chat", path: "/chat", icon: <MessageCircle className="h-6 w-6" /> },
  { name: "Risk", path: "/risk-profile", icon: <BarChart className="h-6 w-6" /> },
  { name: "Recs", path: "/recommendations", icon: <ListChecks className="h-6 w-6" /> },
  { name: "Coach", path: "/coaching", icon: <Activity className="h-6 w-6" /> }
];

const BottomNav = () => {
  const location = useLocation();
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              location.pathname === item.path ? "text-heart-dark" : "text-gray-500"
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BottomNav; 