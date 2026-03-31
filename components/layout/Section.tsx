import React from "react";
import { Container } from "../ui/Container";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  accent?: "grass" | "lava" | "sky" | "sand" | "stone";
  id?: string;
}

export const Section = ({
  children,
  className = "",
  title,
  subtitle,
  accent = "stone",
  id,
}: SectionProps) => {
  const accentColors = {
    grass: "text-grass shadow-grass/20",
    lava: "text-lava shadow-lava/20",
    sky: "text-sky shadow-sky/20",
    sand: "text-sand shadow-sand/20",
    stone: "text-white shadow-white/10",
  };

  return (
    <section id={id} className={`py-16 md:py-24 relative overflow-hidden ${className}`}>
      <Container>
        {(title || subtitle) && (
          <div className="mb-12 md:mb-16 space-y-4">
            {subtitle && (
              <span className={`font-pixel text-[10px] uppercase tracking-widest ${accentColors[accent]}`}>
                // {subtitle}
              </span>
            )}
            {title && (
              <h2 className="text-2xl md:text-3xl text-white">
                {title}
              </h2>
            )}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
};
