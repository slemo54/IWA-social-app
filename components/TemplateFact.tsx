export default function TemplateFact({ 
  text, 
  fontSize = 55, 
  fontFamily = "'Oswald', sans-serif",
  backgroundColor = "#1b6db5",
  textColor = "#1a3b5c",
  textAlign = "center",
  lineHeight = 1.2,
  isSelected = false,
  onTextClick
}: { 
  text: string;
  fontSize?: number;
  fontFamily?: string;
  backgroundColor?: string;
  textColor?: string;
  textAlign?: string;
  lineHeight?: number;
  isSelected?: boolean;
  onTextClick?: () => void;
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor }}>
      {/* Torn Paper (Approximation with CSS) */}
      <div className="relative w-[850px] min-h-[600px] bg-[#f8f5f0] shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-24 z-20 flex items-center justify-center"
           style={{ transform: 'rotate(-1deg)' }}>
        <p 
          className={`relative z-30 uppercase tracking-wide cursor-pointer transition-shadow w-full ${isSelected ? 'ring-4 ring-blue-500 ring-offset-8 rounded-lg' : ''}`}
          style={{ 
            fontSize: `${fontSize}px`, 
            fontFamily, 
            color: textColor, 
            textAlign: textAlign as any, 
            lineHeight 
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (onTextClick) onTextClick();
          }}
        >
          {text}
        </p>
      </div>
    </div>
  );
}
