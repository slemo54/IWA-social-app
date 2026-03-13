import { Wine, Utensils } from 'lucide-react';

export default function TemplateWinePairing({ 
  wine,
  food,
  description,
  fontSize = 45, 
  fontFamily = "'Inter', sans-serif",
  backgroundColor = "#ffffff",
  textColor = "#1a3a6b",
  accentColor = "#c8a96e",
  textAlign = "center",
  lineHeight = 1.4,
  isSelected = false,
  onTextClick
}: { 
  wine: string;
  food: string;
  description: string;
  fontSize?: number;
  fontFamily?: string;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  textAlign?: string;
  lineHeight?: number;
  isSelected?: boolean;
  onTextClick?: () => void;
}) {
  return (
    <div 
      className="absolute inset-0 flex flex-col items-center justify-center p-24"
      style={{ backgroundColor }}
    >
      <div 
        className={`relative z-20 w-full max-w-[900px] flex flex-col items-center gap-16 transition-shadow ${isSelected ? 'ring-4 ring-blue-500 ring-offset-8 rounded-xl p-8' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          if (onTextClick) onTextClick();
        }}
      >
        <h2 
          className="font-black uppercase tracking-widest"
          style={{ fontSize: `${fontSize * 1.5}px`, fontFamily: "'Oswald', sans-serif", color: textColor }}
        >
          PERFECT PAIRING
        </h2>
        
        <div className="flex w-full items-center justify-between gap-8">
          {/* Wine Side */}
          <div className="flex-1 flex flex-col items-center gap-6 p-12 rounded-3xl" style={{ backgroundColor: '#f8f9fa' }}>
            <Wine size={80} style={{ color: accentColor }} />
            <h3 
              className="font-bold uppercase text-center"
              style={{ fontSize: `${fontSize * 1.1}px`, fontFamily: "'Oswald', sans-serif", color: textColor }}
            >
              {wine}
            </h3>
          </div>
          
          {/* Plus */}
          <div className="text-6xl font-light" style={{ color: accentColor }}>+</div>
          
          {/* Food Side */}
          <div className="flex-1 flex flex-col items-center gap-6 p-12 rounded-3xl" style={{ backgroundColor: '#f8f9fa' }}>
            <Utensils size={80} style={{ color: accentColor }} />
            <h3 
              className="font-bold uppercase text-center"
              style={{ fontSize: `${fontSize * 1.1}px`, fontFamily: "'Oswald', sans-serif", color: textColor }}
            >
              {food}
            </h3>
          </div>
        </div>
        
        <div className="w-24 h-2 mt-8" style={{ backgroundColor: accentColor }}></div>
        
        <p 
          className="relative z-30 font-medium tracking-wide w-full"
          style={{ 
            fontSize: `${fontSize}px`, 
            fontFamily, 
            color: textColor, 
            textAlign: textAlign as any, 
            lineHeight 
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
