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
    grass: "bg-grass/20 text-grass border-grass/30 hover:bg-grass/30 shadow-[0_0_10px_rgba(76,175,80,0.2)]",
    lava: "bg-lava/20 text-lava border-lava/30 hover:bg-lava/30 shadow-[0_0_10px_rgba(255,107,53,0.2)]",
    sky: "bg-sky/20 text-sky border-sky/30 hover:bg-sky/30 shadow-[0_0_10px_rgba(91,192,235,0.2)]",
    sand: "bg-sand/20 text-sand border-sand/30 hover:bg-sand/30 shadow-[0_0_10px_rgba(255,209,102,0.2)]",
    stone: "bg-stone/20 text-stone border-stone/30 hover:bg-stone/30",
  };

  const roleIcons: Record<string, string> = {
    architect: "🔥",
    respawner: "⚡",
    spectator: "👀",
  };

  const displayIcon = icon || (typeof children === 'string' ? roleIcons[children.toLowerCase()] : null);

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 font-pixel text-[8px] uppercase border transition-all duration-300 rounded-sm ${variants[variant]} ${className} `} >
      {displayIcon && <span className="opacity-90 scale-125">{displayIcon}</span>}
      {children}
    </span>
  );
};
