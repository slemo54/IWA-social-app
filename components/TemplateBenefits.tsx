import { Award, CheckSquare, MessageCircle, Compass, Globe, Grape } from 'lucide-react';

const iconMap: Record<string, any> = {
  'award': Award,
  'check': CheckSquare,
  'message': MessageCircle,
  'compass': Compass,
  'globe': Globe,
  'grape': Grape,
};

export default function TemplateBenefits({ 
  items,
  fontSize = 55,
  fontFamily = "'Lato', sans-serif",
  textColor = "#ffffff",
  textAlign = "left",
  lineHeight = 1.2,
  isSelected = false,
  onTextClick
}: { 
  items: { icon: string, text: string }[];
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
  textAlign?: string;
  lineHeight?: number;
  isSelected?: boolean;
  onTextClick?: () => void;
}) {
  return (
    <div className="absolute inset-0 px-24 py-20 flex flex-col" style={{ backgroundColor: '#1b6db5' }}>
      {/* List */}
      <div 
        className={`relative z-20 flex flex-col gap-16 flex-grow justify-center pl-12 mt-32 cursor-pointer transition-shadow w-full ${isSelected ? 'ring-4 ring-blue-500 ring-offset-8 rounded-xl p-4' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          if (onTextClick) onTextClick();
        }}
      >
        {items.map((item, i) => {
          const Icon = iconMap[item.icon] || CheckSquare;
          return (
            <div key={i} className={`flex items-center gap-12 relative z-30 ${textAlign === 'center' ? 'justify-center' : textAlign === 'right' ? 'flex-row-reverse' : ''}`}>
              <div className="w-24 h-24 flex items-center justify-center" style={{ color: textColor }}>
                <Icon size={80} strokeWidth={1.5} />
              </div>
              <p className="font-normal tracking-wide flex-1" style={{ fontSize: `${fontSize}px`, fontFamily, color: textColor, textAlign: textAlign as any, lineHeight }}>
                {item.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
