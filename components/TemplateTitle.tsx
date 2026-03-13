export default function TemplateTitle({ 
  text, 
  fontSize = 120, 
  fontFamily = "'Oswald', sans-serif",
  backgroundColor = "#1b6db5",
  textColor = "#ffffff",
  textAlign = "center",
  lineHeight = 1.1,
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
    <div 
      className="absolute inset-0 flex items-center justify-center p-24"
      style={{ backgroundColor }}
    >
      <p 
        className={`relative z-30 uppercase tracking-wide cursor-pointer transition-shadow w-full ${isSelected ? 'ring-4 ring-blue-500 ring-offset-8 rounded-lg p-8' : ''}`}
        style={{ 
          fontSize: `${fontSize}px`, 
          fontFamily, 
          color: textColor, 
          textAlign: textAlign as any, 
          lineHeight, 
          whiteSpace: 'pre-wrap' 
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (onTextClick) onTextClick();
        }}
      >
        {text}
      </p>
    </div>
  );
}
