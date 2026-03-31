import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "grass" | "lava" | "sky" | "sand" | "stone";
  className?: string;
  icon?: React.ReactNode;
}

export const Badge = ({
  children,
  variant = "stone",
  className = "",
  icon,
}: BadgeProps) => {
  const variants = {
    grass: "bg-grass/20 text-grass border-grass/30 hover:bg-grass/30",
    lava: "bg-lava/20 text-lava border-lava/30 hover:bg-lava/30",
    sky: "bg-sky/20 text-sky border-sky/30 hover:bg-sky/30",
    sand: "bg-sand/20 text-sand border-sand/30 hover:bg-sand/30",
    stone: "bg-stone/20 text-stone border-stone/30 hover:bg-stone/30",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 font-pixel text-[8px] uppercase border transition-colors duration-200 ${variants[variant]} ${className} `} >
      {icon && <span className="opacity-80">{icon}</span>}
      {children}
    </span>
  );
};
