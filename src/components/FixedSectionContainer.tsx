
import React from "react";

interface FixedSectionContainerProps {
  children: React.ReactNode;
}

const FixedSectionContainer: React.FC<FixedSectionContainerProps> = ({ children }) => {
  return (
    <div className="w-full max-w-4xl mx-auto mb-6 rounded-xl bg-white shadow-card border border-heart-light p-6 transition-shadow hover:shadow-card-hover">
      {children}
    </div>
  );
};

export default FixedSectionContainer;
