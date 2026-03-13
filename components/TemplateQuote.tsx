import { Quote } from 'lucide-react';

export default function TemplateQuote({ 
  text, 
  author,
  fontSize = 55, 
  fontFamily = "'Playfair Display', serif",
  backgroundColor = "#1a3a6b",
  textColor = "#ffffff",
  accentColor = "#c8a96e",
  textAlign = "center",
  lineHeight = 1.4,
  isSelected = false,
  onTextClick
}: { 
  text: string;
  author?: string;
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
        className={`relative z-20 w-full max-w-[850px] p-16 flex flex-col items-center justify-center transition-shadow ${isSelected ? 'ring-4 ring-blue-500 ring-offset-8 rounded-xl' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          if (onTextClick) onTextClick();
        }}
      >
        <Quote size={80} style={{ color: accentColor }} className="mb-8 opacity-80" />
        
        <p 
          className="relative z-30 tracking-wide w-full italic"
          style={{ 
            fontSize: `${fontSize}px`, 
            fontFamily, 
            color: textColor, 
            textAlign: textAlign as any, 
            lineHeight 
          }}
        >
          "{text}"
        </p>
        
        {author && (
          <div className="mt-12 flex flex-col items-center gap-4">
            <div className="w-16 h-[2px]" style={{ backgroundColor: accentColor }}></div>
            <p 
              className="font-bold tracking-widest uppercase"
              style={{ fontSize: `${fontSize * 0.4}px`, fontFamily: "'Inter', sans-serif", color: textColor }}
            >
              {author}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
