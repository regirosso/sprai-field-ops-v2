import React from 'react';

export const DeepAgroIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Outer Circle with gap at bottom-right */}
      <path 
        d="M72 88C85 82 94 68 94 51C94 26.7 74.3 7 50 7C25.7 7 6 26.7 6 51C6 75.3 25.7 95 50 95C58 95 65 93 72 89" 
        stroke="#1B7340" 
        strokeWidth="8" 
        strokeLinecap="round"
      />
      {/* Central Stem */}
      <path d="M50 35V75" stroke="#1A2B23" strokeWidth="8" strokeLinecap="round"/>
      {/* Left Branch: center -> left-down -> up */}
      <path d="M50 58H35V45" stroke="#1A2B23" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Right Branch: center -> right-up */}
      <path d="M50 58L65 50" stroke="#1A2B23" strokeWidth="8" strokeLinecap="round"/>
      {/* Nodes */}
      <circle cx="50" cy="35" r="6" fill="#1A2B23"/>
      <circle cx="35" cy="45" r="6" fill="#1A2B23"/>
      <circle cx="65" cy="50" r="6" fill="#1A2B23"/>
      <circle cx="72" cy="89" r="5.5" fill="#1B7340"/>
    </svg>
  );
};

export const DeepAgroLogo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <span className="text-2xl font-bold tracking-tight flex items-center leading-none">
        <span className="text-[#004343]">Deep</span>
        <span className="text-[#1B8A43]">Agro</span>
      </span>
    </div>
  );
};

export const SprAILogo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`bg-brand-gold p-2 rounded-xl flex items-center justify-center ${className}`}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B2B1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
    </div>
  );
};
