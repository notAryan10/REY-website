import React from "react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center space-y-8">
      <div className="relative">
        <div className="w-24 h-24 border-4 border-zinc-800 border-t-grass rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-grass/20 rounded-full animate-pulse" />
        </div>
      </div>
      
      <div className="flex flex-col items-center space-y-4">
        <h2 className="text-2xl font-pixel text-white uppercase tracking-widest animate-pulse">Initializing REY</h2>
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div 
              key={i} 
              className="w-2 h-2 bg-grass animate-bounce" 
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>

      <div className="max-w-xs w-full px-4">
        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-grass animate-loading-progress" />
        </div>
        <p className="mt-2 text-[8px] font-pixel text-text-secondary text-center uppercase tracking-tighter">
          Synchronizing with central architect node...
        </p>
      </div>
    </div>
  );
}
