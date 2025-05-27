import React from 'react';

interface EducationalIllustrationProps {
  type: 'school' | 'technology' | 'collaboration' | 'growth';
  className?: string;
}

export function EducationalIllustration({ type, className = "" }: EducationalIllustrationProps) {
  const illustrations = {
    school: (
      <svg viewBox="0 0 400 300" className={className}>
        {/* School Building */}
        <rect x="50" y="150" width="300" height="120" fill="#4F46E5" rx="8"/>
        <rect x="80" y="180" width="60" height="60" fill="#DBEAFE" rx="4"/>
        <rect x="160" y="180" width="80" height="90" fill="#DBEAFE" rx="4"/>
        <rect x="260" y="180" width="60" height="60" fill="#DBEAFE" rx="4"/>
        
        {/* Roof */}
        <polygon points="40,150 200,80 360,150" fill="#EF4444"/>
        
        {/* Flag */}
        <rect x="190" y="80" width="4" height="40" fill="#9CA3AF"/>
        <rect x="194" y="80" width="30" height="20" fill="#10B981"/>
        
        {/* Door */}
        <rect x="180" y="220" width="40" height="50" fill="#7C3AED" rx="20"/>
        
        {/* Windows */}
        <rect x="90" y="190" width="40" height="30" fill="#3B82F6" rx="2"/>
        <rect x="270" y="190" width="40" height="30" fill="#3B82F6" rx="2"/>
        
        {/* Steps */}
        <rect x="160" y="270" width="80" height="8" fill="#6B7280"/>
        <rect x="170" y="278" width="60" height="8" fill="#6B7280"/>
        
        {/* Trees */}
        <circle cx="30" cy="200" r="25" fill="#10B981"/>
        <rect x="26" y="200" width="8" height="30" fill="#92400E"/>
        <circle cx="370" cy="200" r="25" fill="#10B981"/>
        <rect x="366" y="200" width="8" height="30" fill="#92400E"/>
        
        {/* Students */}
        <circle cx="120" cy="240" r="8" fill="#FBBF24"/>
        <rect x="116" y="248" width="8" height="16" fill="#3B82F6"/>
        <circle cx="280" cy="240" r="8" fill="#FBBF24"/>
        <rect x="276" y="248" width="8" height="16" fill="#EF4444"/>
      </svg>
    ),    
    technology: (
      <svg viewBox="0 0 400 300" className={className}>
        {/* Computer/Laptop */}
        <rect x="100" y="140" width="200" height="120" fill="#374151" rx="8"/>
        <rect x="110" y="150" width="180" height="100" fill="#1F2937" rx="4"/>
        
        {/* Screen content */}
        <rect x="120" y="160" width="160" height="80" fill="#3B82F6" rx="4"/>
        <rect x="130" y="170" width="50" height="8" fill="#DBEAFE"/>
        <rect x="130" y="185" width="80" height="8" fill="#DBEAFE"/>
        <rect x="130" y="200" width="60" height="8" fill="#DBEAFE"/>
        
        {/* Wireless signals */}
        <path d="M 320 100 Q 340 120 320 140" stroke="#10B981" strokeWidth="3" fill="none"/>
        <path d="M 325 110 Q 335 120 325 130" stroke="#10B981" strokeWidth="3" fill="none"/>
        <path d="M 330 115 Q 335 120 330 125" stroke="#10B981" strokeWidth="3" fill="none"/>
        
        {/* Cloud */}
        <ellipse cx="300" cy="60" rx="25" ry="15" fill="#E5E7EB"/>
        <ellipse cx="285" cy="60" rx="20" ry="12" fill="#E5E7EB"/>
        <ellipse cx="315" cy="60" rx="20" ry="12" fill="#E5E7EB"/>
        
        {/* Mobile devices */}
        <rect x="50" y="100" width="30" height="50" fill="#374151" rx="6"/>
        <rect x="55" y="110" width="20" height="30" fill="#3B82F6" rx="2"/>
        
        <rect x="350" y="180" width="30" height="50" fill="#374151" rx="6"/>
        <rect x="355" y="190" width="20" height="30" fill="#10B981" rx="2"/>
        
        {/* Connection lines */}
        <line x1="80" y1="125" x2="100" y2="140" stroke="#6B7280" strokeWidth="2" strokeDasharray="5,5"/>
        <line x1="350" y1="205" x2="300" y2="180" stroke="#6B7280" strokeWidth="2" strokeDasharray="5,5"/>
        
        {/* Books */}
        <rect x="20" y="220" width="15" height="40" fill="#EF4444"/>
        <rect x="35" y="215" width="15" height="45" fill="#3B82F6"/>
        <rect x="50" y="225" width="15" height="35" fill="#10B981"/>
      </svg>
    ),    
    collaboration: (
      <svg viewBox="0 0 400 300" className={className}>
        {/* Round table */}
        <ellipse cx="200" cy="200" rx="120" ry="80" fill="#D1D5DB"/>
        <ellipse cx="200" cy="195" rx="120" ry="80" fill="#F3F4F6"/>
        
        {/* Laptops on table */}
        <rect x="160" y="170" width="30" height="20" fill="#374151" rx="2"/>
        <rect x="210" y="185" width="30" height="20" fill="#374151" rx="2"/>
        <rect x="180" y="210" width="30" height="20" fill="#374151" rx="2"/>
        
        {/* People around table */}
        <circle cx="120" cy="150" r="15" fill="#FBBF24"/>
        <rect x="110" y="165" width="20" height="25" fill="#3B82F6"/>
        
        <circle cx="280" cy="160" r="15" fill="#F87171"/>
        <rect x="270" y="175" width="20" height="25" fill="#10B981"/>
        
        <circle cx="200" cy="120" r="15" fill="#A78BFA"/>
        <rect x="190" y="135" width="20" height="25" fill="#EF4444"/>
        
        <circle cx="150" cy="250" r="15" fill="#34D399"/>
        <rect x="140" y="265" width="20" height="25" fill="#F59E0B"/>
        
        <circle cx="250" cy="240" r="15" fill="#60A5FA"/>
        <rect x="240" y="255" width="20" height="25" fill="#8B5CF6"/>
        
        {/* Collaboration symbols */}
        <circle cx="200" cy="195" r="3" fill="#EF4444"/>
        <circle cx="190" cy="185" r="2" fill="#10B981"/>
        <circle cx="210" cy="205" r="2" fill="#3B82F6"/>
        
        {/* Speech bubbles */}
        <ellipse cx="90" cy="120" rx="20" ry="12" fill="#DBEAFE"/>
        <polygon points="105,125 110,135 95,130" fill="#DBEAFE"/>
        
        <ellipse cx="310" cy="130" rx="20" ry="12" fill="#FEE2E2"/>
        <polygon points="295,135 290,145 305,140" fill="#FEE2E2"/>
      </svg>
    ),    
    growth: (
      <svg viewBox="0 0 400 300" className={className}>
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E7EB" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="400" height="300" fill="url(#grid)"/>
        
        {/* Growth chart */}
        <rect x="50" y="50" width="300" height="200" fill="#F9FAFB" stroke="#D1D5DB" strokeWidth="2"/>
        
        {/* Chart bars */}
        <rect x="80" y="200" width="30" height="30" fill="#3B82F6"/>
        <rect x="130" y="180" width="30" height="50" fill="#10B981"/>
        <rect x="180" y="150" width="30" height="80" fill="#F59E0B"/>
        <rect x="230" y="120" width="30" height="110" fill="#EF4444"/>
        <rect x="280" y="90" width="30" height="140" fill="#8B5CF6"/>
        
        {/* Growth arrow */}
        <path d="M 70 220 L 320 100" stroke="#059669" strokeWidth="3"/>
        <polygon points="320,100 310,95 310,105" fill="#059669"/>
        
        {/* Students/graduation caps */}
        <g transform="translate(60, 40)">
          <rect x="0" y="5" width="20" height="3" fill="#1F2937"/>
          <polygon points="10,0 0,5 20,5" fill="#1F2937"/>
          <rect x="8" y="8" width="4" height="8" fill="#1F2937"/>
        </g>
        
        <g transform="translate(120, 30)">
          <rect x="0" y="5" width="20" height="3" fill="#1F2937"/>
          <polygon points="10,0 0,5 20,5" fill="#1F2937"/>
          <rect x="8" y="8" width="4" height="8" fill="#1F2937"/>
        </g>
        
        <g transform="translate(200, 20)">
          <rect x="0" y="5" width="20" height="3" fill="#1F2937"/>
          <polygon points="10,0 0,5 20,5" fill="#1F2937"/>
          <rect x="8" y="8" width="4" height="8" fill="#1F2937"/>
        </g>
        
        {/* Success metrics */}
        <circle cx="350" cy="80" r="25" fill="#ECFDF5" stroke="#10B981" strokeWidth="2"/>
        <text x="350" y="85" textAnchor="middle" fontSize="12" fill="#059669" fontWeight="bold">+40%</text>
        
        {/* Award/trophy */}
        <rect x="30" y="270" width="15" height="20" fill="#F59E0B"/>
        <ellipse cx="37.5" cy="270" rx="10" ry="5" fill="#FBBF24"/>
        <rect x="35" y="290" width="5" height="10" fill="#92400E"/>
      </svg>
    )
  };

  return illustrations[type];
}