import React from "react";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}

export const Container = ({ 
  children, 
  className = "", 
  maxWidth = "max-w-[1200px]" 
}: ContainerProps) => {
  return (
    <div className={`${maxWidth} mx-auto px-4 md:px-6 ${className}`}>
      {children}
    </div>
  );
};
