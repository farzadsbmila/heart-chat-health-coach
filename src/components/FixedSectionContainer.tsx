
import React from "react";

interface FixedSectionContainerProps {
  children: React.ReactNode;
}

const FixedSectionContainer: React.FC<FixedSectionContainerProps> = ({ children }) => {
  return (
    <div className="w-full max-w-4xl mx-auto mb-6 rounded-xl bg-white shadow-lg border-b-4 border-heart transition-all duration-300 ease-in-out">
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default FixedSectionContainer;
