import React from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

const HomeButton = () => {
  return (
    <Link
      to="/"
      className="sticky top-4 left-4 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors w-auto max-w-[120px] border border-blue-700 shadow-md font-bold"
    >
      <ArrowLeft className="h-4 w-4" />
      <Home className="h-5 w-5" />
      <span>Home</span>
    </Link>
  );
};

export default HomeButton; 