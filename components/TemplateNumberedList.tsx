export default function TemplateNumberedList({ 
  items,
  title,
  fontSize = 45,
  fontFamily = "'Lato', sans-serif",
  backgroundColor = "#9c824a",
  textColor = "#ffffff",
  numberColor = "#ffffff",
  textAlign = "left",
  lineHeight = 1.2,
  isSelected = false,
  onTextClick
}: { 
  items: string[];
  title?: string;
  fontSize?: number;
  fontFamily?: string;
  backgroundColor?: string;
  textColor?: string;
  numberColor?: string;
  textAlign?: string;
  lineHeight?: number;
  isSelected?: boolean;
  onTextClick?: () => void;
}) {
  return (
    <div 
      className="absolute inset-0 flex flex-col"
      style={{ backgroundColor }}
    >
      <div 
        className={`relative z-20 flex flex-col flex-grow justify-center mt-32 cursor-pointer transition-shadow w-full ${isSelected ? 'ring-4 ring-blue-500 ring-offset-8 rounded-xl p-4' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          if (onTextClick) onTextClick();
        }}
      >
        {title && (
          <h2 className="relative z-30 font-bold mb-12 uppercase tracking-wider" style={{ fontSize: `${fontSize * 1.5}px`, fontFamily, color: textColor, textAlign: textAlign as any, lineHeight }}>
            {title}
          </h2>
        )}
        
        {items.map((text, i) => (
          <div key={i} className={`relative z-30 flex items-center border-t border-white/30 px-16 py-12 ${textAlign === 'center' ? 'justify-center' : textAlign === 'right' ? 'flex-row-reverse' : ''}`}>
            <div className="w-40 flex-shrink-0 flex justify-center">
              <span 
                className="font-bold tracking-tighter" 
                style={{ 
                  fontSize: '120px', 
                  fontFamily: "'Oswald', sans-serif", 
                  color: 'transparent',
                  WebkitTextStroke: `3px ${numberColor}`
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>
            <p className="font-normal tracking-wide flex-1" style={{ fontSize: `${fontSize}px`, fontFamily, color: textColor, textAlign: textAlign as any, lineHeight }}>
              {text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
