import { Lightbulb } from 'lucide-react';

export default function TemplateDidYouKnow({ 
  text, 
  fontSize = 60, 
  fontFamily = "'Inter', sans-serif",
  backgroundColor = "#e8f0f7",
  textColor = "#1a3a6b",
  accentColor = "#c8a96e",
  textAlign = "center",
  lineHeight = 1.3,
  isSelected = false,
  onTextClick
}: { 
  text: string;
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
        className={`relative z-20 w-full max-w-[850px] bg-white shadow-2xl rounded-3xl p-24 flex flex-col items-center gap-12 transition-shadow ${isSelected ? 'ring-4 ring-blue-500 ring-offset-8' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          if (onTextClick) onTextClick();
        }}
      >
        <div 
          className="w-32 h-32 rounded-full flex items-center justify-center -mt-40 shadow-xl"
          style={{ backgroundColor: accentColor }}
        >
          <Lightbulb size={64} color="#ffffff" />
        </div>
        
        <h2 
          className="font-black uppercase tracking-tighter"
          style={{ fontSize: `${fontSize * 1.2}px`, fontFamily: "'Oswald', sans-serif", color: textColor }}
        >
          DID YOU KNOW?
        </h2>
        
        <div className="w-24 h-2" style={{ backgroundColor: accentColor }}></div>
        
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
          {text}
        </p>
      </div>
    </div>
  );
}
