'use client';

import { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import { Download, Sparkles, LayoutTemplate, Type, Loader2, Upload, X, Image as ImageIcon, Move, PanelLeftClose, PanelLeftOpen, History, RotateCcw, AlignLeft, AlignCenter, AlignRight, MessageSquare, Copy } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { motion } from 'motion/react';
import TemplateFact from '@/components/TemplateFact';
import TemplateBenefits from '@/components/TemplateBenefits';
import TemplateTitle from '@/components/TemplateTitle';
import TemplateNumberedList from '@/components/TemplateNumberedList';
import TemplateEvent from '@/components/TemplateEvent';
import TemplateQuote from '@/components/TemplateQuote';
import TemplateDidYouKnow from '@/components/TemplateDidYouKnow';
import TemplateWinePairing from '@/components/TemplateWinePairing';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

interface MediaFile {
  id: string;
  url: string;
}

interface CanvasMedia {
  id: string;
  url: string;
  x: number;
  y: number;
  scale: number;
  aspectRatio?: string;
  zIndex: number;
  opacity?: number;
}

interface HistoryItem {
  id: string;
  url: string;
  timestamp: number;
  state: {
    activeTemplate: 'fact' | 'benefits' | 'title' | 'numberedList' | 'event' | 'quote' | 'didYouKnow' | 'winePairing';
    postFormat: 'square' | 'portrait';
    factText: string;
    benefits: any[];
    titleText: string;
    numberedListTitle: string;
    numberedListItems: string[];
    eventTitle: string;
    eventDates: string[];
    eventLocation: string;
    quoteText: string;
    quoteAuthor: string;
    didYouKnowText: string;
    winePairingWine: string;
    winePairingFood: string;
    winePairingDesc: string;
    factStyle: any;
    benefitsStyle: any;
    titleStyle: any;
    numberedListStyle: any;
    eventStyle: any;
    quoteStyle: any;
    didYouKnowStyle: any;
    winePairingStyle: any;
    canvasMedia: CanvasMedia[];
    caption: string;
  };
}

export default function Studio() {
  // Templates State
  const [activeTemplate, setActiveTemplate] = useState<'fact' | 'benefits' | 'title' | 'numberedList' | 'event' | 'quote' | 'didYouKnow' | 'winePairing'>('fact');
  const [postFormat, setPostFormat] = useState<'square' | 'portrait'>('portrait');
  const [topic, setTopic] = useState('');
  const [caption, setCaption] = useState('');
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Text Styling State
  const [factStyle, setFactStyle] = useState({ fontSize: 55, fontFamily: "'Oswald', sans-serif", textColor: "#1a3b5c", backgroundColor: "#1b6db5", textAlign: "center", lineHeight: 1.2 });
  const [benefitsStyle, setBenefitsStyle] = useState({ fontSize: 55, fontFamily: "'Lato', sans-serif", textColor: "#ffffff", backgroundColor: "#1b6db5", textAlign: "left", lineHeight: 1.2 });
  const [titleStyle, setTitleStyle] = useState({ fontSize: 120, fontFamily: "'Oswald', sans-serif", backgroundColor: "#1b6db5", textColor: "#ffffff", textAlign: "center", lineHeight: 1.1 });
  const [numberedListStyle, setNumberedListStyle] = useState({ fontSize: 45, fontFamily: "'Lato', sans-serif", backgroundColor: "#9c824a", textColor: "#ffffff", numberColor: "#ffffff", textAlign: "left", lineHeight: 1.2 });
  const [eventStyle, setEventStyle] = useState({ fontSize: 65, fontFamily: "'Oswald', sans-serif", backgroundColor: "#1b6db5", textColor: "#ffffff", accentColor: "#c5a86a", textAlign: "left", lineHeight: 1.2 });
  const [quoteStyle, setQuoteStyle] = useState({ fontSize: 55, fontFamily: "'Playfair Display', serif", backgroundColor: "#1a3a6b", textColor: "#ffffff", accentColor: "#c8a96e", textAlign: "center", lineHeight: 1.4 });
  const [didYouKnowStyle, setDidYouKnowStyle] = useState({ fontSize: 60, fontFamily: "'Inter', sans-serif", backgroundColor: "#e8f0f7", textColor: "#1a3a6b", accentColor: "#c8a96e", textAlign: "center", lineHeight: 1.3 });
  const [winePairingStyle, setWinePairingStyle] = useState({ fontSize: 45, fontFamily: "'Inter', sans-serif", backgroundColor: "#ffffff", textColor: "#1a3a6b", accentColor: "#c8a96e", textAlign: "center", lineHeight: 1.4 });
  
  // Content State
  const [factText, setFactText] = useState('1. MOSCATO BIANCO IS ASSOCIATED WITH THE ASTI REGION WHERE IT IS MADE INTO GENTLY SPARKLING AROMATIC SWEET WINES.');
  const [benefits, setBenefits] = useState([
    { icon: 'award', text: 'International Certification' },
    { icon: 'check', text: 'Professional Qualification' },
    { icon: 'message', text: 'Shared Wine Language' },
    { icon: 'compass', text: 'Learning Support' },
    { icon: 'globe', text: 'Network and community' },
    { icon: 'grape', text: 'More than just wine' },
  ]);
  const [titleText, setTitleText] = useState('IWA\nPOST\n4:5\nCOMPLETO');
  const [numberedListTitle, setNumberedListTitle] = useState('5 REASONS WHY\nYOU SHOULD JOIN OUR\nChampagne Specialist\nCOURSE');
  const [numberedListItems, setNumberedListItems] = useState([
    'It is one of the most technical and fascinating wines in the world.',
    'Understanding how Champagne is made allows you to appreciate all sparkling wines more',
    'You can immerse yourself in the luxurious Champagne lifestyle, even if only for a few days',
    'Champagne is culture, terroir, history, and prestige.',
    'You can rave about it... but with knowledge.'
  ]);
  const [eventTitle, setEventTitle] = useState('Champagne Specialist');
  const [eventDates, setEventDates] = useState(['14 - 15 November 2025', '28 - 29 November 2025']);
  const [eventLocation, setEventLocation] = useState('Italian Wine Academy, Verona');
  const [quoteText, setQuoteText] = useState('Wine is the most healthful and most hygienic of beverages.');
  const [quoteAuthor, setQuoteAuthor] = useState('Louis Pasteur');
  const [didYouKnowText, setDidYouKnowText] = useState('Italy has over 400 native grape varieties, making it the country with the greatest diversity of wine grapes in the world.');
  const [winePairingWine, setWinePairingWine] = useState('Chianti Classico');
  const [winePairingFood, setWinePairingFood] = useState('Bistecca alla Fiorentina');
  const [winePairingDesc, setWinePairingDesc] = useState('The high acidity and tannins of Sangiovese cut through the rich, fatty protein of the steak perfectly.');

  // Review State
  const [reviewFeedback, setReviewFeedback] = useState<{item: string, passed: boolean, feedback: string}[] | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Media State
  const [mediaLibrary, setMediaLibrary] = useState<MediaFile[]>([
    { id: 'logo-iwa', url: 'https://placehold.co/400x400/1b6db5/ffffff/png?text=IWA+Logo' },
    { id: 'logo-wset', url: 'https://placehold.co/600x200/ffffff/1b6db5/png?text=WSET+Provider' },
    { id: 'logo-ais', url: 'https://placehold.co/400x400/ffffff/1b6db5/png?text=AIS+FVG' },
    { id: 'logo-champagne', url: 'https://placehold.co/400x400/c5a86a/000000/png?text=Champagne+Edu' },
  ]);
  const [canvasMedia, setCanvasMedia] = useState<CanvasMedia[]>([]);
  const [selectedCanvasMediaId, setSelectedCanvasMediaId] = useState<string | null>(null);

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaLibrary(prev => [...prev, {
          id: Date.now().toString() + Math.random().toString(36).substring(7),
          url: reader.result as string
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const addMediaToCanvas = (media: MediaFile) => {
    setCanvasMedia(prev => [...prev, {
      id: Date.now().toString(),
      url: media.url,
      x: 100,
      y: 100,
      scale: 1,
      aspectRatio: 'auto',
      zIndex: 25,
    }]);
  };

  const removeCanvasMedia = (id: string) => {
    setCanvasMedia(prev => prev.filter(m => m.id !== id));
    if (selectedCanvasMediaId === id) setSelectedCanvasMediaId(null);
  };

  const updateCanvasMediaScale = (id: string, scale: number) => {
    setCanvasMedia(prev => prev.map(m => m.id === id ? { ...m, scale } : m));
  };

  const updateCanvasMediaAspectRatio = (id: string, aspectRatio: string) => {
    setCanvasMedia(prev => prev.map(m => m.id === id ? { ...m, aspectRatio } : m));
  };

  const updateCanvasMediaZIndex = (id: string, zIndex: number) => {
    setCanvasMedia(prev => prev.map(m => m.id === id ? { ...m, zIndex } : m));
  };

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    
    // Deselect media before downloading to hide controls
    setSelectedCanvasMediaId(null);
    setSelectedElementId(null);
    
    // Small delay to allow React to re-render without selection borders
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      const node = canvasRef.current;
      const dataUrl = await toPng(node, {
        cacheBust: true,
        quality: 1,
        pixelRatio: 2, // High resolution export
        style: { transform: 'scale(1)', transformOrigin: 'top left' },
        width: 1080,
        height: postFormat === 'square' ? 1080 : 1350,
      });
      
      const timestamp = Date.now();
      
      // Save to history
      setHistory(prev => [{
        id: timestamp.toString(),
        url: dataUrl,
        timestamp: timestamp,
        state: {
          activeTemplate,
          postFormat,
          factText,
          benefits,
          titleText,
          numberedListTitle,
          numberedListItems,
          eventTitle,
          eventDates,
          eventLocation,
          quoteText,
          quoteAuthor,
          didYouKnowText,
          winePairingWine,
          winePairingFood,
          winePairingDesc,
          factStyle,
          benefitsStyle,
          titleStyle,
          numberedListStyle,
          eventStyle,
          quoteStyle,
          didYouKnowStyle,
          winePairingStyle,
          canvasMedia,
          caption
        }
      }, ...prev]);

      // Download Image
      const link = document.createElement('a');
      link.download = `iwa-post-${timestamp}.png`;
      link.href = dataUrl;
      link.click();
      
      // Download Caption if it exists
      if (caption.trim()) {
        const blob = new Blob([caption], { type: 'text/plain' });
        const textUrl = URL.createObjectURL(blob);
        const textLink = document.createElement('a');
        textLink.download = `iwa-caption-${timestamp}.txt`;
        textLink.href = textUrl;
        textLink.click();
        URL.revokeObjectURL(textUrl);
      }
    } catch (err) {
      console.error('Failed to download image', err);
    }
  };

  const restoreHistoryItem = (item: HistoryItem) => {
    setActiveTemplate(item.state.activeTemplate);
    setPostFormat(item.state.postFormat || 'portrait');
    setFactText(item.state.factText);
    setBenefits(item.state.benefits);
    setTitleText(item.state.titleText);
    setNumberedListTitle(item.state.numberedListTitle);
    setNumberedListItems(item.state.numberedListItems);
    setEventTitle(item.state.eventTitle);
    setEventDates(item.state.eventDates);
    setEventLocation(item.state.eventLocation);
    setQuoteText(item.state.quoteText || '');
    setQuoteAuthor(item.state.quoteAuthor || '');
    setDidYouKnowText(item.state.didYouKnowText || '');
    setWinePairingWine(item.state.winePairingWine || '');
    setWinePairingFood(item.state.winePairingFood || '');
    setWinePairingDesc(item.state.winePairingDesc || '');
    setFactStyle({ fontSize: 55, fontFamily: "'Oswald', sans-serif", textColor: "#1a3b5c", backgroundColor: "#1b6db5", textAlign: "center", lineHeight: 1.2, ...item.state.factStyle });
    setBenefitsStyle({ fontSize: 55, fontFamily: "'Lato', sans-serif", textColor: "#ffffff", backgroundColor: "#1b6db5", textAlign: "left", lineHeight: 1.2, ...item.state.benefitsStyle });
    setTitleStyle({ fontSize: 120, fontFamily: "'Oswald', sans-serif", backgroundColor: "#1b6db5", textColor: "#ffffff", textAlign: "center", lineHeight: 1.1, ...item.state.titleStyle });
    setNumberedListStyle({ fontSize: 45, fontFamily: "'Lato', sans-serif", backgroundColor: "#9c824a", textColor: "#ffffff", numberColor: "#ffffff", textAlign: "left", lineHeight: 1.2, ...item.state.numberedListStyle });
    setEventStyle({ fontSize: 65, fontFamily: "'Oswald', sans-serif", backgroundColor: "#1b6db5", textColor: "#ffffff", accentColor: "#c5a86a", textAlign: "left", lineHeight: 1.2, ...item.state.eventStyle });
    setQuoteStyle({ fontSize: 55, fontFamily: "'Playfair Display', serif", backgroundColor: "#1a3a6b", textColor: "#ffffff", accentColor: "#c8a96e", textAlign: "center", lineHeight: 1.4, ...(item.state.quoteStyle || {}) });
    setDidYouKnowStyle({ fontSize: 60, fontFamily: "'Inter', sans-serif", backgroundColor: "#e8f0f7", textColor: "#1a3a6b", accentColor: "#c8a96e", textAlign: "center", lineHeight: 1.3, ...(item.state.didYouKnowStyle || {}) });
    setWinePairingStyle({ fontSize: 45, fontFamily: "'Inter', sans-serif", backgroundColor: "#ffffff", textColor: "#1a3a6b", accentColor: "#c8a96e", textAlign: "center", lineHeight: 1.4, ...(item.state.winePairingStyle || {}) });
    setCanvasMedia(item.state.canvasMedia);
    setCaption(item.state.caption || '');
    setIsHistoryOpen(false);
  };

  const handleReview = async () => {
    if (!canvasRef.current) return;
    
    setIsReviewing(true);
    setSelectedCanvasMediaId(null);
    setSelectedElementId(null);
    
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      const node = canvasRef.current;
      const dataUrl = await toPng(node, {
        cacheBust: true,
        quality: 0.8,
        pixelRatio: 1,
        style: { transform: 'scale(1)', transformOrigin: 'top left' },
        width: 1080,
        height: postFormat === 'square' ? 1080 : 1350,
      });
      
      const base64Data = dataUrl.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: 'image/png'
              }
            },
            {
              text: `Review this Instagram post design for the Italian Wine Academy. 
              Provide a design review checklist in JSON format.
              The JSON should be an array of objects, where each object has:
              - "item": a short string describing the check (e.g., "Typography is legible")
              - "passed": a boolean indicating if the check passed
              - "feedback": a short string with constructive feedback or praise
              
              Check for things like:
              - Text readability against the background
              - Proper alignment and spacing (padding/margins)
              - Brand consistency (colors: #1a3a6b, #ffffff, #c8a96e, #e8f0f7)
              - Overall visual balance and professional look
              
              Return ONLY the raw JSON array, without markdown formatting or code blocks.`
            }
          ]
        }
      });
      
      if (response.text) {
        try {
          // Clean up the response text to ensure it's valid JSON
          const jsonStr = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsedFeedback = JSON.parse(jsonStr);
          setReviewFeedback(parsedFeedback);
        } catch (parseError) {
          console.error("Failed to parse review JSON:", parseError);
          setReviewFeedback([{ item: "Error parsing feedback", passed: false, feedback: "The AI returned an invalid format. Please try again." }]);
        }
      }
    } catch (err) {
      console.error('Failed to review image', err);
      setReviewFeedback([{ item: "Error generating review", passed: false, feedback: "Failed to connect to the AI service. Please try again." }]);
    } finally {
      setIsReviewing(false);
    }
  };

  const generateContent = async () => {
    setIsGeneratingText(true);
    try {
      const basePrompt = topic 
        ? `Focus specifically on the topic: "${topic}". ` 
        : `Focus on Italian wine, WSET certification, grape varieties, regions, or wine pairings. `;
        
      const captionPrompt = `Also generate a highly engaging Instagram caption for this post. Include relevant emojis and hashtags (like #italianwine #wset #winelovers #italianwineacademy). Keep the caption under 2200 characters.`;

      if (activeTemplate === 'fact') {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `${basePrompt} Generate a short, interesting fact about wine. It should be 1-2 sentences. ${captionPrompt} Return the result as a JSON object with "fact" (string) and "caption" (string).`,
          config: { responseMimeType: "application/json" }
        });
        if (response.text) {
          const data = JSON.parse(response.text);
          setFactText(`1. ${data.fact.toUpperCase()}`);
          setCaption(data.caption);
        }
      } else if (activeTemplate === 'benefits') {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `${basePrompt} Generate a list of 6 benefits of taking a wine certification course or learning about this topic. Keep each benefit to 2-4 words. ${captionPrompt} Return the result as a JSON object with "benefits" (array of 6 strings) and "caption" (string).`,
          config: { responseMimeType: "application/json" }
        });
        if (response.text) {
          const data = JSON.parse(response.text);
          const icons = ['award', 'check', 'message', 'compass', 'globe', 'grape'];
          const newBenefits = data.benefits.slice(0, 6).map((text: string, i: number) => ({
            icon: icons[i % icons.length],
            text: text
          }));
          setBenefits(newBenefits);
          setCaption(data.caption);
        }
      } else if (activeTemplate === 'title') {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `${basePrompt} Generate a catchy, short title for a wine course or event. Maximum 5 words. ${captionPrompt} Return the result as a JSON object with "title" (string) and "caption" (string).`,
          config: { responseMimeType: "application/json" }
        });
        if (response.text) {
          const data = JSON.parse(response.text);
          setTitleText(data.title.toUpperCase());
          setCaption(data.caption);
        }
      } else if (activeTemplate === 'numberedList') {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `${basePrompt} Generate a title and a list of 5 key points/regions/facts. ${captionPrompt} Return the result as a JSON object with "title" (string), "items" (array of 5 strings), and "caption" (string).`,
          config: { responseMimeType: "application/json" }
        });
        if (response.text) {
          const data = JSON.parse(response.text);
          setNumberedListTitle(data.title.toUpperCase());
          setNumberedListItems(data.items.slice(0, 5));
          setCaption(data.caption);
        }
      } else if (activeTemplate === 'event') {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `${basePrompt} Generate details for a wine tasting or educational event. Include a catchy title (max 4 words), 2 dates (e.g. "14 - 15 November 2025"), and a location in Italy. ${captionPrompt} Return the result as a JSON object with "title" (string), "dates" (array of 2 strings), "location" (string), and "caption" (string).`,
          config: { responseMimeType: "application/json" }
        });
        if (response.text) {
          const data = JSON.parse(response.text);
          setEventTitle(data.title.toUpperCase());
          setEventDates(data.dates.slice(0, 2));
          setEventLocation(data.location.toUpperCase());
          setCaption(data.caption);
        }
      } else if (activeTemplate === 'quote') {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `${basePrompt} Generate a famous or inspiring quote about wine. ${captionPrompt} Return the result as a JSON object with "quote" (string), "author" (string), and "caption" (string).`,
          config: { responseMimeType: "application/json" }
        });
        if (response.text) {
          const data = JSON.parse(response.text);
          setQuoteText(data.quote);
          setQuoteAuthor(data.author);
          setCaption(data.caption);
        }
      } else if (activeTemplate === 'didYouKnow') {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `${basePrompt} Generate a surprising "Did you know?" fact about wine. ${captionPrompt} Return the result as a JSON object with "fact" (string) and "caption" (string).`,
          config: { responseMimeType: "application/json" }
        });
        if (response.text) {
          const data = JSON.parse(response.text);
          setDidYouKnowText(data.fact);
          setCaption(data.caption);
        }
      } else if (activeTemplate === 'winePairing') {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `${basePrompt} Generate a perfect wine and food pairing. Include the wine name, the food name, and a 1-2 sentence description of why they pair well. ${captionPrompt} Return the result as a JSON object with "wine" (string), "food" (string), "description" (string), and "caption" (string).`,
          config: { responseMimeType: "application/json" }
        });
        if (response.text) {
          const data = JSON.parse(response.text);
          setWinePairingWine(data.wine);
          setWinePairingFood(data.food);
          setWinePairingDesc(data.description);
          setCaption(data.caption);
        }
      }
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setIsGeneratingText(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <style dangerouslySetInnerHTML={{__html: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Lato:wght@400;700&family=Merriweather:wght@400;700&family=Oswald:wght@400;500&family=Playfair+Display:wght@400;700&display=swap');`}} />
      {/* Top Navigation */}
      <header className="bg-[#1b6db5] text-white px-6 py-4 flex items-center justify-between shadow-md z-20">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="p-2 hover:bg-white/20 rounded-full transition-colors mr-2"
            title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
          </button>
          <div className="w-10 h-10 rounded-full border-2 border-white flex flex-col items-center justify-center text-center text-[6px] font-bold tracking-widest relative bg-white/10">
            <span className="absolute top-1 left-1/2 -translate-x-1/2 uppercase">Italian</span>
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 uppercase">Academy</span>
            <span className="absolute left-0.5 top-1/2 -translate-y-1/2 uppercase" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Wine</span>
            <div className="text-xl font-light">P</div>
          </div>
          <h1 className="text-xl font-bold tracking-wide">IWA AI Studio</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-6 rounded-full flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <History size={18} />
            History
          </button>
          <button
            onClick={handleReview}
            disabled={isReviewing}
            className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-6 rounded-full flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50"
          >
            {isReviewing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            Review Design
          </button>
          <button
            onClick={handleDownload}
            className="bg-white text-[#1b6db5] hover:bg-gray-100 font-medium py-2 px-6 rounded-full flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Download size={18} />
            Download Post
          </button>
        </div>
      </header>

      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar */}
        {isSidebarOpen && (
          <div className="w-full md:w-[400px] bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto z-10 shadow-lg">
            <div className="p-6 flex-grow flex flex-col gap-8">
            
            {/* Template Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">1. Choose Template</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveTemplate('fact')}
                  className={`p-4 border-2 rounded-xl flex flex-col items-center gap-3 transition-all ${activeTemplate === 'fact' ? 'border-[#1b6db5] bg-blue-50 text-[#1b6db5] shadow-sm' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-600'}`}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${activeTemplate === 'fact' ? 'bg-[#1b6db5] text-white' : 'bg-gray-100'}`}>
                    <Type size={24} />
                  </div>
                  <span className="text-sm font-semibold">Fact</span>
                </button>
                <button
                  onClick={() => setActiveTemplate('benefits')}
                  className={`p-4 border-2 rounded-xl flex flex-col items-center gap-3 transition-all ${activeTemplate === 'benefits' ? 'border-[#1b6db5] bg-blue-50 text-[#1b6db5] shadow-sm' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-600'}`}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${activeTemplate === 'benefits' ? 'bg-[#1b6db5] text-white' : 'bg-gray-100'}`}>
                    <LayoutTemplate size={24} />
                  </div>
                  <span className="text-sm font-semibold">Benefits List</span>
                </button>
                <button
                  onClick={() => setActiveTemplate('title')}
                  className={`p-4 border-2 rounded-xl flex flex-col items-center gap-3 transition-all ${activeTemplate === 'title' ? 'border-[#1b6db5] bg-blue-50 text-[#1b6db5] shadow-sm' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-600'}`}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${activeTemplate === 'title' ? 'bg-[#1b6db5] text-white' : 'bg-gray-100'}`}>
                    <Type size={24} />
                  </div>
                  <span className="text-sm font-semibold">Title</span>
                </button>
                <button
                  onClick={() => setActiveTemplate('numberedList')}
                  className={`p-4 border-2 rounded-xl flex flex-col items-center gap-3 transition-all ${activeTemplate === 'numberedList' ? 'border-[#1b6db5] bg-blue-50 text-[#1b6db5] shadow-sm' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-600'}`}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${activeTemplate === 'numberedList' ? 'bg-[#1b6db5] text-white' : 'bg-gray-100'}`}>
                    <LayoutTemplate size={24} />
                  </div>
                  <span className="text-sm font-semibold">Numbered List</span>
                </button>
                <button
                  onClick={() => setActiveTemplate('event')}
                  className={`p-4 border-2 rounded-xl flex flex-col items-center gap-3 transition-all ${activeTemplate === 'event' ? 'border-[#1b6db5] bg-blue-50 text-[#1b6db5] shadow-sm' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-600'}`}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${activeTemplate === 'event' ? 'bg-[#1b6db5] text-white' : 'bg-gray-100'}`}>
                    <LayoutTemplate size={24} />
                  </div>
                  <span className="text-sm font-semibold">Event</span>
                </button>
                <button
                  onClick={() => setActiveTemplate('quote')}
                  className={`p-4 border-2 rounded-xl flex flex-col items-center gap-3 transition-all ${activeTemplate === 'quote' ? 'border-[#1b6db5] bg-blue-50 text-[#1b6db5] shadow-sm' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-600'}`}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${activeTemplate === 'quote' ? 'bg-[#1b6db5] text-white' : 'bg-gray-100'}`}>
                    <Type size={24} />
                  </div>
                  <span className="text-sm font-semibold">Quote</span>
                </button>
                <button
                  onClick={() => setActiveTemplate('didYouKnow')}
                  className={`p-4 border-2 rounded-xl flex flex-col items-center gap-3 transition-all ${activeTemplate === 'didYouKnow' ? 'border-[#1b6db5] bg-blue-50 text-[#1b6db5] shadow-sm' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-600'}`}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${activeTemplate === 'didYouKnow' ? 'bg-[#1b6db5] text-white' : 'bg-gray-100'}`}>
                    <LayoutTemplate size={24} />
                  </div>
                  <span className="text-sm font-semibold">Did You Know?</span>
                </button>
                <button
                  onClick={() => setActiveTemplate('winePairing')}
                  className={`p-4 border-2 rounded-xl flex flex-col items-center gap-3 transition-all ${activeTemplate === 'winePairing' ? 'border-[#1b6db5] bg-blue-50 text-[#1b6db5] shadow-sm' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-600'}`}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${activeTemplate === 'winePairing' ? 'bg-[#1b6db5] text-white' : 'bg-gray-100'}`}>
                    <LayoutTemplate size={24} />
                  </div>
                  <span className="text-sm font-semibold">Wine Pairing</span>
                </button>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Format Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">2. Format</label>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setPostFormat('square')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${postFormat === 'square' ? 'bg-white text-[#1b6db5] shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Square (1:1)
                </button>
                <button
                  onClick={() => setPostFormat('portrait')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${postFormat === 'portrait' ? 'bg-white text-[#1b6db5] shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Portrait (4:5)
                </button>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Content Section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-gray-900">3. Edit Content</label>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col gap-3">
                <label className="text-xs font-bold text-[#1b6db5]">AI Assistant</label>
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Topic (e.g. Barolo, WSET Level 2)"
                  className="w-full text-sm border border-blue-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#1b6db5]"
                />
                <button
                  onClick={generateContent}
                  disabled={isGeneratingText}
                  className="w-full text-sm flex items-center justify-center gap-2 text-white font-medium bg-[#1b6db5] hover:bg-[#155a96] px-4 py-2.5 rounded-lg disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isGeneratingText ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  Generate Content & Caption
                </button>
              </div>

              {activeTemplate === 'fact' ? (
                <textarea
                  value={factText}
                  onChange={(e) => setFactText(e.target.value)}
                  rows={6}
                  className="w-full text-sm border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-[#1b6db5] focus:border-[#1b6db5] outline-none resize-none shadow-sm bg-gray-50"
                  placeholder="Enter fact text..."
                />
              ) : activeTemplate === 'benefits' ? (
                <div className="flex flex-col gap-3">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#1b6db5]/10 rounded-full flex items-center justify-center flex-shrink-0 text-[#1b6db5] text-xs font-bold">
                        {index + 1}
                      </div>
                      <input
                        type="text"
                        value={benefit.text}
                        onChange={(e) => {
                          const newBenefits = [...benefits];
                          newBenefits[index].text = e.target.value;
                          setBenefits(newBenefits);
                        }}
                        className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#1b6db5] focus:border-[#1b6db5] outline-none bg-gray-50"
                      />
                    </div>
                  ))}
                </div>
              ) : activeTemplate === 'title' ? (
                <textarea
                  value={titleText}
                  onChange={(e) => setTitleText(e.target.value)}
                  rows={6}
                  className="w-full text-sm border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-[#1b6db5] focus:border-[#1b6db5] outline-none resize-none shadow-sm bg-gray-50"
                  placeholder="Enter title text..."
                />
              ) : activeTemplate === 'numberedList' ? (
                <div className="flex flex-col gap-3">
                  <textarea
                    value={numberedListTitle}
                    onChange={(e) => setNumberedListTitle(e.target.value)}
                    rows={3}
                    className="w-full text-sm border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-[#1b6db5] focus:border-[#1b6db5] outline-none resize-none shadow-sm bg-gray-50 mb-2"
                    placeholder="Enter list title..."
                  />
                  {numberedListItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#1b6db5]/10 rounded-full flex items-center justify-center flex-shrink-0 text-[#1b6db5] text-xs font-bold">
                        {index + 1}
                      </div>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const newItems = [...numberedListItems];
                          newItems[index] = e.target.value;
                          setNumberedListItems(newItems);
                        }}
                        className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#1b6db5] focus:border-[#1b6db5] outline-none bg-gray-50"
                      />
                    </div>
                  ))}
                </div>
              ) : activeTemplate === 'event' ? (
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#1b6db5] focus:border-[#1b6db5] outline-none bg-gray-50"
                    placeholder="Event Title"
                  />
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#1b6db5] focus:border-[#1b6db5] outline-none bg-gray-50"
                    placeholder="Event Location"
                  />
                  {eventDates.map((date, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#1b6db5]/10 rounded-full flex items-center justify-center flex-shrink-0 text-[#1b6db5] text-xs font-bold">
                        D{index + 1}
                      </div>
                      <input
                        type="text"
                        value={date}
                        onChange={(e) => {
                          const newDates = [...eventDates];
                          newDates[index] = e.target.value;
                          setEventDates(newDates);
                        }}
                        className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#1b6db5] focus:border-[#1b6db5] outline-none bg-gray-50"
                      />
                    </div>
                  ))}
                </div>
              ) : activeTemplate === 'quote' ? (
                <div className="flex flex-col gap-3">
                  <textarea
                    value={quoteText}
                    onChange={(e) => setQuoteText(e.target.value)}
                    rows={4}
                    className="w-full text-sm border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-[#1b6db5] focus:border-[#1b6db5] outline-none resize-none shadow-sm bg-gray-50"
                    placeholder="Enter quote text..."
                  />
                  <input
                    type="text"
                    value={quoteAuthor}
                    onChange={(e) => setQuoteAuthor(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#1b6db5] focus:border-[#1b6db5] outline-none bg-gray-50"
                    placeholder="Author"
                  />
                </div>
              ) : activeTemplate === 'didYouKnow' ? (
                <textarea
                  value={didYouKnowText}
                  onChange={(e) => setDidYouKnowText(e.target.value)}
                  rows={6}
                  className="w-full text-sm border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-[#1b6db5] focus:border-[#1b6db5] outline-none resize-none shadow-sm bg-gray-50"
                  placeholder="Enter fact text..."
                />
              ) : activeTemplate === 'winePairing' ? (
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={winePairingWine}
                    onChange={(e) => setWinePairingWine(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#1b6db5] focus:border-[#1b6db5] outline-none bg-gray-50"
                    placeholder="Wine Name"
                  />
                  <input
                    type="text"
                    value={winePairingFood}
                    onChange={(e) => setWinePairingFood(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#1b6db5] focus:border-[#1b6db5] outline-none bg-gray-50"
                    placeholder="Food Name"
                  />
                  <textarea
                    value={winePairingDesc}
                    onChange={(e) => setWinePairingDesc(e.target.value)}
                    rows={4}
                    className="w-full text-sm border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-[#1b6db5] focus:border-[#1b6db5] outline-none resize-none shadow-sm bg-gray-50"
                    placeholder="Description..."
                  />
                </div>
              ) : null}
            </div>

            <hr className="border-gray-100" />

            {/* Background Color Section */}
            <div className="flex flex-col gap-4">
              <label className="block text-sm font-bold text-gray-900">4. Background Color</label>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={
                    activeTemplate === 'fact' ? factStyle.backgroundColor :
                    activeTemplate === 'benefits' ? benefitsStyle.backgroundColor :
                    activeTemplate === 'title' ? titleStyle.backgroundColor :
                    activeTemplate === 'numberedList' ? numberedListStyle.backgroundColor :
                    activeTemplate === 'event' ? eventStyle.backgroundColor :
                    activeTemplate === 'quote' ? quoteStyle.backgroundColor :
                    activeTemplate === 'didYouKnow' ? didYouKnowStyle.backgroundColor :
                    winePairingStyle.backgroundColor
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (activeTemplate === 'fact') setFactStyle(s => ({...s, backgroundColor: val}));
                    else if (activeTemplate === 'benefits') setBenefitsStyle(s => ({...s, backgroundColor: val}));
                    else if (activeTemplate === 'title') setTitleStyle(s => ({...s, backgroundColor: val}));
                    else if (activeTemplate === 'numberedList') setNumberedListStyle(s => ({...s, backgroundColor: val}));
                    else if (activeTemplate === 'event') setEventStyle(s => ({...s, backgroundColor: val}));
                    else if (activeTemplate === 'quote') setQuoteStyle(s => ({...s, backgroundColor: val}));
                    else if (activeTemplate === 'didYouKnow') setDidYouKnowStyle(s => ({...s, backgroundColor: val}));
                    else setWinePairingStyle(s => ({...s, backgroundColor: val}));
                  }}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0.5 bg-white"
                />
                <span className="text-sm text-gray-600 font-mono uppercase">
                  {
                    activeTemplate === 'fact' ? factStyle.backgroundColor :
                    activeTemplate === 'benefits' ? benefitsStyle.backgroundColor :
                    activeTemplate === 'title' ? titleStyle.backgroundColor :
                    activeTemplate === 'numberedList' ? numberedListStyle.backgroundColor :
                    activeTemplate === 'event' ? eventStyle.backgroundColor :
                    activeTemplate === 'quote' ? quoteStyle.backgroundColor :
                    activeTemplate === 'didYouKnow' ? didYouKnowStyle.backgroundColor :
                    winePairingStyle.backgroundColor
                  }
                </span>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Text Styling Section */}
            {selectedElementId === 'text' && (
              <>
                <div className="flex flex-col gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <label className="block text-sm font-bold text-[#1b6db5]">Text Styling</label>
                  
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Font Family</label>
                    <select
                      value={
                        activeTemplate === 'fact' ? factStyle.fontFamily :
                        activeTemplate === 'benefits' ? benefitsStyle.fontFamily :
                        activeTemplate === 'title' ? titleStyle.fontFamily :
                        activeTemplate === 'numberedList' ? numberedListStyle.fontFamily :
                        activeTemplate === 'event' ? eventStyle.fontFamily :
                        activeTemplate === 'quote' ? quoteStyle.fontFamily :
                        activeTemplate === 'didYouKnow' ? didYouKnowStyle.fontFamily :
                        winePairingStyle.fontFamily
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (activeTemplate === 'fact') setFactStyle(s => ({...s, fontFamily: val}));
                        else if (activeTemplate === 'benefits') setBenefitsStyle(s => ({...s, fontFamily: val}));
                        else if (activeTemplate === 'title') setTitleStyle(s => ({...s, fontFamily: val}));
                        else if (activeTemplate === 'numberedList') setNumberedListStyle(s => ({...s, fontFamily: val}));
                        else if (activeTemplate === 'event') setEventStyle(s => ({...s, fontFamily: val}));
                        else if (activeTemplate === 'quote') setQuoteStyle(s => ({...s, fontFamily: val}));
                        else if (activeTemplate === 'didYouKnow') setDidYouKnowStyle(s => ({...s, fontFamily: val}));
                        else setWinePairingStyle(s => ({...s, fontFamily: val}));
                      }}
                      className="w-full text-sm border border-gray-200 rounded-lg p-2 outline-none bg-white"
                    >
                      <option value="'Oswald', sans-serif">Oswald</option>
                      <option value="'Lato', sans-serif">Lato</option>
                      <option value="'Inter', sans-serif">Inter</option>
                      <option value="'Playfair Display', serif">Playfair Display</option>
                      <option value="'Merriweather', serif">Merriweather</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Font Size ({
                      activeTemplate === 'fact' ? factStyle.fontSize :
                      activeTemplate === 'benefits' ? benefitsStyle.fontSize :
                      activeTemplate === 'title' ? titleStyle.fontSize :
                      activeTemplate === 'numberedList' ? numberedListStyle.fontSize :
                      activeTemplate === 'event' ? eventStyle.fontSize :
                      activeTemplate === 'quote' ? quoteStyle.fontSize :
                      activeTemplate === 'didYouKnow' ? didYouKnowStyle.fontSize :
                      winePairingStyle.fontSize
                    }px)</label>
                    <input 
                      type="range" 
                      min="20" 
                      max="120" 
                      step="1" 
                      value={
                        activeTemplate === 'fact' ? factStyle.fontSize :
                        activeTemplate === 'benefits' ? benefitsStyle.fontSize :
                        activeTemplate === 'title' ? titleStyle.fontSize :
                        activeTemplate === 'numberedList' ? numberedListStyle.fontSize :
                        activeTemplate === 'event' ? eventStyle.fontSize :
                        activeTemplate === 'quote' ? quoteStyle.fontSize :
                        activeTemplate === 'didYouKnow' ? didYouKnowStyle.fontSize :
                        winePairingStyle.fontSize
                      }
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (activeTemplate === 'fact') setFactStyle(s => ({...s, fontSize: val}));
                        else if (activeTemplate === 'benefits') setBenefitsStyle(s => ({...s, fontSize: val}));
                        else if (activeTemplate === 'title') setTitleStyle(s => ({...s, fontSize: val}));
                        else if (activeTemplate === 'numberedList') setNumberedListStyle(s => ({...s, fontSize: val}));
                        else if (activeTemplate === 'event') setEventStyle(s => ({...s, fontSize: val}));
                        else if (activeTemplate === 'quote') setQuoteStyle(s => ({...s, fontSize: val}));
                        else if (activeTemplate === 'didYouKnow') setDidYouKnowStyle(s => ({...s, fontSize: val}));
                        else setWinePairingStyle(s => ({...s, fontSize: val}));
                      }}
                      className="w-full accent-[#1b6db5]"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Text Color</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={
                          activeTemplate === 'fact' ? factStyle.textColor :
                          activeTemplate === 'benefits' ? benefitsStyle.textColor :
                          activeTemplate === 'title' ? titleStyle.textColor :
                          activeTemplate === 'numberedList' ? numberedListStyle.textColor :
                          activeTemplate === 'event' ? eventStyle.textColor :
                          activeTemplate === 'quote' ? quoteStyle.textColor :
                          activeTemplate === 'didYouKnow' ? didYouKnowStyle.textColor :
                          winePairingStyle.textColor
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (activeTemplate === 'fact') setFactStyle(s => ({...s, textColor: val}));
                          else if (activeTemplate === 'benefits') setBenefitsStyle(s => ({...s, textColor: val}));
                          else if (activeTemplate === 'title') setTitleStyle(s => ({...s, textColor: val}));
                          else if (activeTemplate === 'numberedList') setNumberedListStyle(s => ({...s, textColor: val}));
                          else if (activeTemplate === 'event') setEventStyle(s => ({...s, textColor: val}));
                          else if (activeTemplate === 'quote') setQuoteStyle(s => ({...s, textColor: val}));
                          else if (activeTemplate === 'didYouKnow') setDidYouKnowStyle(s => ({...s, textColor: val}));
                          else setWinePairingStyle(s => ({...s, textColor: val}));
                        }}
                        className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                      />
                      <span className="text-xs text-gray-500 uppercase font-mono">
                        {
                          activeTemplate === 'fact' ? factStyle.textColor :
                          activeTemplate === 'benefits' ? benefitsStyle.textColor :
                          activeTemplate === 'title' ? titleStyle.textColor :
                          activeTemplate === 'numberedList' ? numberedListStyle.textColor :
                          activeTemplate === 'event' ? eventStyle.textColor :
                          activeTemplate === 'quote' ? quoteStyle.textColor :
                          activeTemplate === 'didYouKnow' ? didYouKnowStyle.textColor :
                          winePairingStyle.textColor
                        }
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Alignment</label>
                      <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
                        {(['left', 'center', 'right'] as const).map((align) => {
                          const currentAlign = 
                            activeTemplate === 'fact' ? factStyle.textAlign :
                            activeTemplate === 'benefits' ? benefitsStyle.textAlign :
                            activeTemplate === 'title' ? titleStyle.textAlign :
                            activeTemplate === 'numberedList' ? numberedListStyle.textAlign :
                            activeTemplate === 'event' ? eventStyle.textAlign :
                            activeTemplate === 'quote' ? quoteStyle.textAlign :
                            activeTemplate === 'didYouKnow' ? didYouKnowStyle.textAlign :
                            winePairingStyle.textAlign;
                            
                          return (
                            <button
                              key={align}
                              onClick={() => {
                                if (activeTemplate === 'fact') setFactStyle(s => ({...s, textAlign: align}));
                                else if (activeTemplate === 'benefits') setBenefitsStyle(s => ({...s, textAlign: align}));
                                else if (activeTemplate === 'title') setTitleStyle(s => ({...s, textAlign: align}));
                                else if (activeTemplate === 'numberedList') setNumberedListStyle(s => ({...s, textAlign: align}));
                                else if (activeTemplate === 'event') setEventStyle(s => ({...s, textAlign: align}));
                                else if (activeTemplate === 'quote') setQuoteStyle(s => ({...s, textAlign: align}));
                                else if (activeTemplate === 'didYouKnow') setDidYouKnowStyle(s => ({...s, textAlign: align}));
                                else setWinePairingStyle(s => ({...s, textAlign: align}));
                              }}
                              className={`flex-1 py-1.5 flex justify-center items-center transition-colors ${currentAlign === align ? 'bg-[#1b6db5] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                              {align === 'left' ? <AlignLeft size={16} /> : align === 'center' ? <AlignCenter size={16} /> : <AlignRight size={16} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Line Height ({
                        activeTemplate === 'fact' ? factStyle.lineHeight :
                        activeTemplate === 'benefits' ? benefitsStyle.lineHeight :
                        activeTemplate === 'title' ? titleStyle.lineHeight :
                        activeTemplate === 'numberedList' ? numberedListStyle.lineHeight :
                        activeTemplate === 'event' ? eventStyle.lineHeight :
                        activeTemplate === 'quote' ? quoteStyle.lineHeight :
                        activeTemplate === 'didYouKnow' ? didYouKnowStyle.lineHeight :
                        winePairingStyle.lineHeight
                      })</label>
                      <input 
                        type="range" 
                        min="0.8" 
                        max="2.5" 
                        step="0.1" 
                        value={
                          activeTemplate === 'fact' ? factStyle.lineHeight :
                          activeTemplate === 'benefits' ? benefitsStyle.lineHeight :
                          activeTemplate === 'title' ? titleStyle.lineHeight :
                          activeTemplate === 'numberedList' ? numberedListStyle.lineHeight :
                          activeTemplate === 'event' ? eventStyle.lineHeight :
                          activeTemplate === 'quote' ? quoteStyle.lineHeight :
                          activeTemplate === 'didYouKnow' ? didYouKnowStyle.lineHeight :
                          winePairingStyle.lineHeight
                        }
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (activeTemplate === 'fact') setFactStyle(s => ({...s, lineHeight: val}));
                          else if (activeTemplate === 'benefits') setBenefitsStyle(s => ({...s, lineHeight: val}));
                          else if (activeTemplate === 'title') setTitleStyle(s => ({...s, lineHeight: val}));
                          else if (activeTemplate === 'numberedList') setNumberedListStyle(s => ({...s, lineHeight: val}));
                          else if (activeTemplate === 'event') setEventStyle(s => ({...s, lineHeight: val}));
                          else if (activeTemplate === 'quote') setQuoteStyle(s => ({...s, lineHeight: val}));
                          else if (activeTemplate === 'didYouKnow') setDidYouKnowStyle(s => ({...s, lineHeight: val}));
                          else setWinePairingStyle(s => ({...s, lineHeight: val}));
                        }}
                        className="w-full accent-[#1b6db5] mt-2"
                      />
                    </div>
                  </div>
                </div>
                <hr className="border-gray-100" />
              </>
            )}

            {/* Media Section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-gray-900">3. Media & Logos</label>
                <label className="cursor-pointer text-xs flex items-center gap-1.5 text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors">
                  <Upload size={14} />
                  Upload
                  <input type="file" accept="image/*" multiple onChange={handleMediaUpload} className="hidden" />
                </label>
              </div>
              
              <p className="text-xs text-gray-500">Upload logos or images, then click to add them to the canvas. You can drag them around freely.</p>

              {mediaLibrary.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {mediaLibrary.map((media) => (
                    <div 
                      key={media.id} 
                      onClick={() => addMediaToCanvas(media)}
                      className="aspect-square bg-gray-100 rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#1b6db5] transition-all group relative"
                    >
                      <img src={media.url} alt="Media" className="w-full h-full object-contain p-2" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-white text-xs font-medium">Add</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-gray-50">
                  <ImageIcon size={32} className="text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-gray-700">No media uploaded</p>
                  <p className="text-xs text-gray-500 mt-1">Upload logos to place them on the template</p>
                </div>
              )}

              {/* Selected Media Controls */}
              {selectedCanvasMediaId && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#1b6db5]">Selected Media</span>
                    <button 
                      onClick={() => removeCanvasMedia(selectedCanvasMediaId)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                    >
                      <X size={12} /> Remove
                    </button>
                  </div>
                  <label className="text-xs text-gray-600 block mb-1">Scale</label>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="3" 
                    step="0.1" 
                    value={canvasMedia.find(m => m.id === selectedCanvasMediaId)?.scale || 1}
                    onChange={(e) => updateCanvasMediaScale(selectedCanvasMediaId, parseFloat(e.target.value))}
                    className="w-full accent-[#1b6db5]"
                  />
                  <div className="mt-3">
                    <label className="text-xs text-gray-600 block mb-1">Aspect Ratio</label>
                    <select
                      value={canvasMedia.find(m => m.id === selectedCanvasMediaId)?.aspectRatio || 'auto'}
                      onChange={(e) => updateCanvasMediaAspectRatio(selectedCanvasMediaId, e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded p-1.5 outline-none bg-white"
                    >
                      <option value="auto">Auto (Original)</option>
                      <option value="1/1">1:1 (Square)</option>
                      <option value="4/3">4:3 (Landscape)</option>
                      <option value="16/9">16:9 (Widescreen)</option>
                      <option value="3/4">3:4 (Portrait)</option>
                      <option value="9/16">9:16 (Vertical)</option>
                    </select>
                  </div>
                  <div className="mt-3">
                    <label className="text-xs text-gray-600 block mb-1">Layer (Z-Index): {canvasMedia.find(m => m.id === selectedCanvasMediaId)?.zIndex || 25}</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="50" 
                      step="1" 
                      value={canvasMedia.find(m => m.id === selectedCanvasMediaId)?.zIndex || 25}
                      onChange={(e) => updateCanvasMediaZIndex(selectedCanvasMediaId, parseInt(e.target.value))}
                      className="w-full accent-[#1b6db5]"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                      <span>Background</span>
                      <span>Foreground</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        )}

        {/* Canvas Area */}
        <div className="flex-grow bg-gray-200 flex items-center justify-center p-8 overflow-auto relative" onClick={() => { setSelectedCanvasMediaId(null); setSelectedElementId(null); }}>
          <div 
            className="relative shadow-2xl bg-white overflow-hidden transition-all duration-300" 
            style={{ 
              width: '486px', 
              height: postFormat === 'square' ? '486px' : '607.5px' 
            }}
          >
            <div
              ref={canvasRef}
              className={`absolute top-0 left-0 w-[1080px] origin-top-left bg-white overflow-hidden transition-all duration-300 ${postFormat === 'square' ? 'h-[1080px]' : 'h-[1350px]'}`}
              style={{ transform: 'scale(0.45)' }}
            >
              {/* Base Template */}
              {activeTemplate === 'fact' ? (
                <TemplateFact 
                  text={factText} 
                  fontSize={factStyle.fontSize}
                  fontFamily={factStyle.fontFamily}
                  textColor={factStyle.textColor}
                  textAlign={factStyle.textAlign}
                  lineHeight={factStyle.lineHeight}
                  isSelected={selectedElementId === 'text'}
                  onTextClick={() => { setSelectedElementId('text'); setSelectedCanvasMediaId(null); }}
                />
              ) : activeTemplate === 'benefits' ? (
                <TemplateBenefits 
                  items={benefits} 
                  fontSize={benefitsStyle.fontSize}
                  fontFamily={benefitsStyle.fontFamily}
                  textColor={benefitsStyle.textColor}
                  textAlign={benefitsStyle.textAlign}
                  lineHeight={benefitsStyle.lineHeight}
                  isSelected={selectedElementId === 'text'}
                  onTextClick={() => { setSelectedElementId('text'); setSelectedCanvasMediaId(null); }}
                />
              ) : activeTemplate === 'title' ? (
                <TemplateTitle
                  text={titleText}
                  fontSize={titleStyle.fontSize}
                  fontFamily={titleStyle.fontFamily}
                  textColor={titleStyle.textColor}
                  textAlign={titleStyle.textAlign}
                  lineHeight={titleStyle.lineHeight}
                  isSelected={selectedElementId === 'text'}
                  onTextClick={() => { setSelectedElementId('text'); setSelectedCanvasMediaId(null); }}
                />
              ) : activeTemplate === 'numberedList' ? (
                <TemplateNumberedList
                  title={numberedListTitle}
                  items={numberedListItems}
                  fontSize={numberedListStyle.fontSize}
                  fontFamily={numberedListStyle.fontFamily}
                  textColor={numberedListStyle.textColor}
                  textAlign={numberedListStyle.textAlign}
                  lineHeight={numberedListStyle.lineHeight}
                  isSelected={selectedElementId === 'text'}
                  onTextClick={() => { setSelectedElementId('text'); setSelectedCanvasMediaId(null); }}
                />
              ) : activeTemplate === 'event' ? (
                <TemplateEvent
                  title={eventTitle}
                  location={eventLocation}
                  dates={eventDates}
                  fontSize={eventStyle.fontSize}
                  fontFamily={eventStyle.fontFamily}
                  textColor={eventStyle.textColor}
                  textAlign={eventStyle.textAlign}
                  lineHeight={eventStyle.lineHeight}
                  isSelected={selectedElementId === 'text'}
                  onTextClick={() => { setSelectedElementId('text'); setSelectedCanvasMediaId(null); }}
                />
              ) : activeTemplate === 'quote' ? (
                <TemplateQuote
                  text={quoteText}
                  author={quoteAuthor}
                  fontSize={quoteStyle.fontSize}
                  fontFamily={quoteStyle.fontFamily}
                  textColor={quoteStyle.textColor}
                  textAlign={quoteStyle.textAlign}
                  lineHeight={quoteStyle.lineHeight}
                  isSelected={selectedElementId === 'text'}
                  onTextClick={() => { setSelectedElementId('text'); setSelectedCanvasMediaId(null); }}
                />
              ) : activeTemplate === 'didYouKnow' ? (
                <TemplateDidYouKnow
                  text={didYouKnowText}
                  fontSize={didYouKnowStyle.fontSize}
                  fontFamily={didYouKnowStyle.fontFamily}
                  textColor={didYouKnowStyle.textColor}
                  textAlign={didYouKnowStyle.textAlign}
                  lineHeight={didYouKnowStyle.lineHeight}
                  isSelected={selectedElementId === 'text'}
                  onTextClick={() => { setSelectedElementId('text'); setSelectedCanvasMediaId(null); }}
                />
              ) : (
                <TemplateWinePairing
                  wine={winePairingWine}
                  food={winePairingFood}
                  description={winePairingDesc}
                  fontSize={winePairingStyle.fontSize}
                  fontFamily={winePairingStyle.fontFamily}
                  textColor={winePairingStyle.textColor}
                  textAlign={winePairingStyle.textAlign}
                  lineHeight={winePairingStyle.lineHeight}
                  isSelected={selectedElementId === 'text'}
                  onTextClick={() => { setSelectedElementId('text'); setSelectedCanvasMediaId(null); }}
                />
              )}

              {/* Draggable Media Layer */}
              {canvasMedia.map((media) => (
                <motion.div
                  key={media.id}
                  drag
                  dragMomentum={false}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCanvasMediaId(media.id);
                    setSelectedElementId(media.id);
                  }}
                  className={`absolute top-0 left-0 cursor-move ${selectedCanvasMediaId === media.id ? 'ring-4 ring-blue-500 ring-offset-4' : ''}`}
                  initial={{ x: media.x, y: media.y, scale: media.scale }}
                  animate={{ scale: media.scale }}
                  style={{ 
                    transformOrigin: 'center center',
                    zIndex: media.zIndex
                  }}
                >
                  <img 
                    src={media.url} 
                    alt="Canvas Media" 
                    className="w-64 pointer-events-none"
                    style={{
                      aspectRatio: media.aspectRatio && media.aspectRatio !== 'auto' ? media.aspectRatio : 'auto',
                      objectFit: media.aspectRatio && media.aspectRatio !== 'auto' ? 'cover' : 'contain'
                    }}
                  />
                  
                  {/* Visual indicator for dragging */}
                  {selectedCanvasMediaId === media.id && (
                    <div className="absolute -top-4 -right-4 bg-blue-500 text-white rounded-full p-1 shadow-md">
                      <Move size={16} />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Caption Section */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex flex-col gap-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-[#1b6db5] flex items-center gap-1.5">
                <MessageSquare size={16} />
                Instagram Caption
              </label>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium ${caption.length > 2200 ? 'text-red-500' : 'text-gray-500'}`}>
                  {caption.length} / 2200
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(caption);
                    alert('Caption copied to clipboard!');
                  }}
                  className="text-xs flex items-center gap-1.5 text-gray-600 hover:text-[#1b6db5] font-medium transition-colors bg-gray-100 hover:bg-blue-50 px-3 py-1.5 rounded-full"
                >
                  <Copy size={14} />
                  Copy
                </button>
              </div>
            </div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#1b6db5] focus:border-[#1b6db5] outline-none resize-none shadow-sm bg-gray-50"
              placeholder="Write your Instagram caption here... or use AI Generate to create one automatically."
            />
          </div>
        </div>
      </div>

      {/* Review Feedback Modal */}
      {reviewFeedback && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl max-h-[80vh] flex flex-col">
            <h3 className="text-lg font-bold text-[#1b6db5] mb-4 flex items-center gap-2">
              <Sparkles size={20} />
              AI Design Review
            </h3>
            <div className="overflow-y-auto flex-grow mb-6 pr-2">
              <div className="space-y-4">
                {reviewFeedback.map((check, index) => (
                  <div key={index} className="flex gap-3 items-start border-b border-gray-100 pb-4 last:border-0">
                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${check.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {check.passed ? <span className="text-xs font-bold">✓</span> : <span className="text-xs font-bold">!</span>}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-800">{check.item}</h4>
                      <p className="text-sm text-gray-600 mt-1">{check.feedback}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button 
                onClick={() => setReviewFeedback(null)}
                className="bg-[#1b6db5] text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {isHistoryOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
              <h3 className="text-xl font-bold text-[#1b6db5] flex items-center gap-2">
                <History size={24} />
                Creation History
              </h3>
              <button onClick={() => setIsHistoryOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-grow bg-gray-50">
              {history.length === 0 ? (
                <div className="text-center text-gray-500 py-12 flex flex-col items-center gap-4">
                  <History size={48} className="text-gray-300" />
                  <p>No creations yet. Download a post to save it to your history!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {history.map(item => (
                    <div key={item.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3 group">
                      <div className="relative overflow-hidden rounded-lg border border-gray-100 aspect-[4/5] bg-gray-100">
                        <img src={item.url} alt="History item" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button
                            onClick={() => restoreHistoryItem(item)}
                            className="bg-white text-[#1b6db5] p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
                            title="Restore this version"
                          >
                            <RotateCcw size={20} />
                          </button>
                          <a 
                            href={item.url} 
                            download={`iwa-post-${item.timestamp}.png`}
                            className="bg-white text-[#1b6db5] p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
                            title="Download again"
                          >
                            <Download size={20} />
                          </a>
                        </div>
                      </div>
                      <div className="flex justify-between items-center px-1">
                        <span className="text-xs font-medium text-gray-500">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
