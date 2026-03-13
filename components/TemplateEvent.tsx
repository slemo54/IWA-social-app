export default function TemplateEvent({ 
  title,
  dates,
  location,
  fontSize = 65,
  fontFamily = "'Oswald', sans-serif",
  backgroundColor = "#1b6db5",
  textColor = "#ffffff",
  accentColor = "#c5a86a",
  textAlign = "left",
  lineHeight = 1.2,
  isSelected = false,
  onTextClick
}: { 
  title: string;
  dates: string[];
  location: string;
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
        className={`relative z-20 w-full max-w-[850px] border-[6px] p-24 flex flex-col gap-16 transition-shadow ${isSelected ? 'ring-4 ring-blue-500 ring-offset-8 rounded-xl' : ''}`}
        style={{ borderColor: accentColor }}
        onClick={(e) => {
          e.stopPropagation();
          if (onTextClick) onTextClick();
        }}
      >
        {/* Title Badge */}
        <div 
          className="absolute -top-16 left-1/2 -translate-x-1/2 px-16 py-6 shadow-lg z-30"
          style={{ backgroundColor: accentColor }}
        >
          <h2 
            className="text-center font-bold tracking-wide uppercase"
            style={{ fontSize: `${fontSize}px`, fontFamily, color: textColor, lineHeight }}
          >
            {title}
          </h2>
        </div>

        {/* Dates & Location */}
        <div className="relative z-30 flex flex-col gap-16 mt-16">
          {dates.map((date, i) => (
            <div key={i} className={`flex flex-col gap-4 ${textAlign === 'center' ? 'items-center' : textAlign === 'right' ? 'items-end' : 'items-start'}`}>
              <div className={`flex items-center gap-8 ${textAlign === 'right' ? 'flex-row-reverse' : ''}`}>
                <div className="w-24 h-[3px]" style={{ backgroundColor: textColor }}></div>
                <h3 className="font-bold tracking-wider" style={{ fontSize: `${fontSize * 0.9}px`, fontFamily: "'Lato', sans-serif", color: textColor, textAlign: textAlign as any, lineHeight }}>
                  {date}
                </h3>
              </div>
              <p className={`font-light tracking-wide ${textAlign === 'center' ? '' : textAlign === 'right' ? 'pr-32' : 'pl-32'}`} style={{ fontSize: `${fontSize * 0.7}px`, fontFamily: "'Lato', sans-serif", color: textColor, textAlign: textAlign as any, lineHeight }}>
                {location}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
