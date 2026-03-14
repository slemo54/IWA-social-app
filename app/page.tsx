'use client';

import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import {
  Download, Sparkles, LayoutTemplate, Type, Loader2, Upload, X,
  Image as ImageIcon, Move, PanelLeftClose, PanelLeftOpen, History,
  RotateCcw, AlignLeft, AlignCenter, AlignRight, MessageSquare, Copy,
} from 'lucide-react';
import { motion } from 'motion/react';

import TemplateFact from '@/components/TemplateFact';
import TemplateBenefits from '@/components/TemplateBenefits';
import TemplateTitle from '@/components/TemplateTitle';
import TemplateNumberedList from '@/components/TemplateNumberedList';
import TemplateEvent from '@/components/TemplateEvent';
import TemplateQuote from '@/components/TemplateQuote';
import TemplateDidYouKnow from '@/components/TemplateDidYouKnow';
import TemplateWinePairing from '@/components/TemplateWinePairing';
import { ToastContainer } from '@/components/ToastContainer';
import { useStudioState, TemplateType } from '@/hooks/use-studio-state';
import { useToast } from '@/hooks/use-toast';

export default function Studio() {
  const studio = useStudioState();
  const { toasts, showToast, dismissToast } = useToast();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedCanvasMediaId, setSelectedCanvasMediaId] = useState<string | null>(null);
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState<
    { item: string; passed: boolean; feedback: string }[] | null
  >(null);

  // ── Canvas snapshot helper ────────────────────────────────────────────────
  const captureCanvas = async (pixelRatio = 2) => {
    if (!canvasRef.current) return null;
    setSelectedCanvasMediaId(null);
    setSelectedElementId(null);
    await new Promise((r) => setTimeout(r, 50));
    return toPng(canvasRef.current, {
      cacheBust: true,
      quality: 1,
      pixelRatio,
      style: { transform: 'scale(1)', transformOrigin: 'top left' },
      width: 1080,
      height: studio.postFormat === 'square' ? 1080 : 1350,
    });
  };

  // ── Download ──────────────────────────────────────────────────────────────
  const handleDownload = async () => {
    try {
      const dataUrl = await captureCanvas(2);
      if (!dataUrl) return;

      const timestamp = Date.now();
      studio.pushHistory(dataUrl);

      const link = document.createElement('a');
      link.download = `iwa-post-${timestamp}.png`;
      link.href = dataUrl;
      link.click();

      if (studio.caption.trim()) {
        const blob = new Blob([studio.caption], { type: 'text/plain' });
        const textUrl = URL.createObjectURL(blob);
        const textLink = document.createElement('a');
        textLink.download = `iwa-caption-${timestamp}.txt`;
        textLink.href = textUrl;
        textLink.click();
        URL.revokeObjectURL(textUrl);
      }
    } catch (err) {
      console.error('Download failed', err);
      showToast('Failed to download image. Please try again.', 'error');
    }
  };

  // ── AI Generate ───────────────────────────────────────────────────────────
  const generateContent = async () => {
    setIsGeneratingText(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: studio.activeTemplate, topic: studio.topic }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const icons = ['award', 'check', 'message', 'compass', 'globe', 'grape'];

      switch (studio.activeTemplate) {
        case 'fact':
          studio.setFactText(`1. ${(data.fact as string).toUpperCase()}`);
          break;
        case 'benefits':
          studio.setBenefits(
            (data.benefits as string[]).slice(0, 6).map((text, i) => ({
              icon: icons[i % icons.length],
              text,
            }))
          );
          break;
        case 'title':
          studio.setTitleText((data.title as string).toUpperCase());
          break;
        case 'numberedList':
          studio.setNumberedListTitle((data.title as string).toUpperCase());
          studio.setNumberedListItems((data.items as string[]).slice(0, 5));
          break;
        case 'event':
          studio.setEventTitle((data.title as string).toUpperCase());
          studio.setEventDates((data.dates as string[]).slice(0, 2));
          studio.setEventLocation((data.location as string).toUpperCase());
          break;
        case 'quote':
          studio.setQuoteText(data.quote as string);
          studio.setQuoteAuthor(data.author as string);
          break;
        case 'didYouKnow':
          studio.setDidYouKnowText(data.fact as string);
          break;
        case 'winePairing':
          studio.setWinePairingWine(data.wine as string);
          studio.setWinePairingFood(data.food as string);
          studio.setWinePairingDesc(data.description as string);
          break;
      }
      if (data.caption) studio.setCaption(data.caption as string);
    } catch (error) {
      console.error('Error generating content:', error);
      showToast('Failed to generate content. Please try again.', 'error');
    } finally {
      setIsGeneratingText(false);
    }
  };

  // ── AI Review ─────────────────────────────────────────────────────────────
  const handleReview = async () => {
    setIsReviewing(true);
    try {
      const dataUrl = await captureCanvas(1);
      if (!dataUrl) return;

      const base64Data = dataUrl.split(',')[1];
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Data }),
      });
      if (!res.ok) throw new Error(await res.text());
      const feedback = await res.json();
      setReviewFeedback(feedback);
    } catch (err) {
      console.error('Review failed', err);
      setReviewFeedback([
        {
          item: 'Error generating review',
          passed: false,
          feedback: 'Failed to connect to the AI service. Please try again.',
        },
      ]);
    } finally {
      setIsReviewing(false);
    }
  };

  // ── Style shortcuts ───────────────────────────────────────────────────────
  const { activeStyle, updateActiveStyle } = studio;

  // ── Render helpers ────────────────────────────────────────────────────────
  const templateButtons: { id: TemplateType; label: string; icon: React.ReactNode }[] = [
    { id: 'fact', label: 'Fact', icon: <Type size={24} /> },
    { id: 'benefits', label: 'Benefits List', icon: <LayoutTemplate size={24} /> },
    { id: 'title', label: 'Title', icon: <Type size={24} /> },
    { id: 'numberedList', label: 'Numbered List', icon: <LayoutTemplate size={24} /> },
    { id: 'event', label: 'Event', icon: <LayoutTemplate size={24} /> },
    { id: 'quote', label: 'Quote', icon: <Type size={24} /> },
    { id: 'didYouKnow', label: 'Did You Know?', icon: <LayoutTemplate size={24} /> },
    { id: 'winePairing', label: 'Wine Pairing', icon: <LayoutTemplate size={24} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <style
        dangerouslySetInnerHTML={{
          __html: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Lato:wght@400;700&family=Merriweather:wght@400;700&family=Oswald:wght@400;500&family=Playfair+Display:wght@400;700&display=swap');`,
        }}
      />

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="bg-[#1b6db5] text-white px-6 py-4 flex items-center justify-between shadow-md z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/20 rounded-full transition-colors mr-2"
            title={isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
          </button>
          <div className="w-10 h-10 rounded-full border-2 border-white flex flex-col items-center justify-center text-center text-[6px] font-bold tracking-widest relative bg-white/10">
            <span className="absolute top-1 left-1/2 -translate-x-1/2 uppercase">Italian</span>
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 uppercase">Academy</span>
            <span
              className="absolute left-0.5 top-1/2 -translate-y-1/2 uppercase"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              Wine
            </span>
            <div className="text-xl font-light">P</div>
          </div>
          <h1 className="text-xl font-bold tracking-wide">IWA AI Studio</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-6 rounded-full flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <History size={18} /> History
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
            <Download size={18} /> Download Post
          </button>
        </div>
      </header>

      <div className="flex flex-grow overflow-hidden">
        {/* ── Sidebar ────────────────────────────────────────────────────── */}
        {isSidebarOpen && (
          <div className="w-full md:w-[400px] bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto z-10 shadow-lg">
            <div className="p-6 flex-grow flex flex-col gap-8">

              {/* 1. Template Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">1. Choose Template</label>
                <div className="grid grid-cols-2 gap-3">
                  {templateButtons.map(({ id, label, icon }) => (
                    <button
                      key={id}
                      onClick={() => studio.setActiveTemplate(id)}
                      className={`p-4 border-2 rounded-xl flex flex-col items-center gap-3 transition-all ${
                        studio.activeTemplate === id
                          ? 'border-[#1b6db5] bg-blue-50 text-[#1b6db5] shadow-sm'
                          : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center ${
                          studio.activeTemplate === id ? 'bg-[#1b6db5] text-white' : 'bg-gray-100'
                        }`}
                      >
                        {icon}
                      </div>
                      <span className="text-sm font-semibold">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* 2. Format */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">2. Format</label>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  {(['square', 'portrait'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => studio.setPostFormat(fmt)}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                        studio.postFormat === fmt
                          ? 'bg-white text-[#1b6db5] shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {fmt === 'square' ? 'Square (1:1)' : 'Portrait (4:5)'}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* 3. Edit Content */}
              <div className="flex flex-col gap-4">
                <label className="block text-sm font-bold text-gray-900">3. Edit Content</label>

                {/* AI assistant */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col gap-3">
                  <label className="text-xs font-bold text-[#1b6db5]">AI Assistant</label>
                  <input
                    type="text"
                    value={studio.topic}
                    onChange={(e) => studio.setTopic(e.target.value)}
                    placeholder="Topic (e.g. Barolo, WSET Level 2)"
                    className="w-full text-sm border border-blue-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#1b6db5]"
                  />
                  <button
                    onClick={generateContent}
                    disabled={isGeneratingText}
                    className="w-full text-sm flex items-center justify-center gap-2 text-white font-medium bg-[#1b6db5] hover:bg-[#155a96] px-4 py-2.5 rounded-lg disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {isGeneratingText ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Sparkles size={16} />
                    )}
                    Generate Content &amp; Caption
                  </button>
                </div>

                {/* Template-specific content editors */}
                {studio.activeTemplate === 'fact' && (
                  <textarea
                    value={studio.factText}
                    onChange={(e) => studio.setFactText(e.target.value)}
                    rows={6}
                    className="w-full text-sm border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-[#1b6db5] focus:border-[#1b6db5] outline-none resize-none shadow-sm bg-gray-50"
                    placeholder="Enter fact text..."
                  />
                )}

                {studio.activeTemplate === 'benefits' && (
                  <div className="flex flex-col gap-3">
                    {studio.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#1b6db5]/10 rounded-full flex items-center justify-center flex-shrink-0 text-[#1b6db5] text-xs font-bold">
                          {index + 1}
                        </div>
                        <input
                          type="text"
                          value={benefit.text}
                          onChange={(e) => {
                            const newBenefits = [...studio.benefits];
                            newBenefits[index] = { ...newBenefits[index], text: e.target.value };
                            studio.setBenefits(newBenefits);
                          }}
                          className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#1b6db5] focus:border-[#1b6db5] outline-none bg-gray-50"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {studio.activeTemplate === 'title' && (
                  <textarea
                    value={studio.titleText}
                    onChange={(e) => studio.setTitleText(e.target.value)}
                    rows={6}
                    className="w-full text-sm border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-[#1b6db5] focus:border-[#1b6db5] outline-none resize-none shadow-sm bg-gray-50"
                    placeholder="Enter title text..."
                  />
                )}

                {studio.activeTemplate === 'numberedList' && (
                  <div className="flex flex-col gap-3">
                    <textarea
                      value={studio.numberedListTitle}
                      onChange={(e) => studio.setNumberedListTitle(e.target.value)}
                      rows={3}
                      className="w-full text-sm border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-[#1b6db5] focus:border-[#1b6db5] outline-none resize-none shadow-sm bg-gray-50 mb-2"
                      placeholder="Enter list title..."
                    />
                    {studio.numberedListItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#1b6db5]/10 rounded-full flex items-center justify-center flex-shrink-0 text-[#1b6db5] text-xs font-bold">
                          {index + 1}
                        </div>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const newItems = [...studio.numberedListItems];
                            newItems[index] = e.target.value;
                            studio.setNumberedListItems(newItems);
                          }}
                          className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#1b6db5] focus:border-[#1b6db5] outline-none bg-gray-50"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {studio.activeTemplate === 'event' && (
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={studio.eventTitle}
                      onChange={(e) => studio.setEventTitle(e.target.value)}
                      className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#1b6db5] focus:border-[#1b6db5] outline-none bg-gray-50"
                      placeholder="Event Title"
                    />
                    <input
                      type="text"
                      value={studio.eventLocation}
                      onChange={(e) => studio.setEventLocation(e.target.value)}
                      className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#1b6db5] focus:border-[#1b6db5] outline-none bg-gray-50"
                      placeholder="Event Location"
                    />
                    {studio.eventDates.map((date, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#1b6db5]/10 rounded-full flex items-center justify-center flex-shrink-0 text-[#1b6db5] text-xs font-bold">
                          D{index + 1}
                        </div>
                        <input
                          type="text"
                          value={date}
                          onChange={(e) => {
                            const newDates = [...studio.eventDates];
                            newDates[index] = e.target.value;
                            studio.setEventDates(newDates);
                          }}
                          className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#1b6db5] focus:border-[#1b6db5] outline-none bg-gray-50"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {studio.activeTemplate === 'quote' && (
                  <div className="flex flex-col gap-3">
                    <textarea
                      value={studio.quoteText}
                      onChange={(e) => studio.setQuoteText(e.target.value)}
                      rows={4}
                      className="w-full text-sm border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-[#1b6db5] focus:border-[#1b6db5] outline-none resize-none shadow-sm bg-gray-50"
                      placeholder="Enter quote text..."
                    />
                    <input
                      type="text"
                      value={studio.quoteAuthor}
                      onChange={(e) => studio.setQuoteAuthor(e.target.value)}
                      className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#1b6db5] focus:border-[#1b6db5] outline-none bg-gray-50"
                      placeholder="Author"
                    />
                  </div>
                )}

                {studio.activeTemplate === 'didYouKnow' && (
                  <textarea
                    value={studio.didYouKnowText}
                    onChange={(e) => studio.setDidYouKnowText(e.target.value)}
                    rows={6}
                    className="w-full text-sm border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-[#1b6db5] focus:border-[#1b6db5] outline-none resize-none shadow-sm bg-gray-50"
                    placeholder="Enter fact text..."
                  />
                )}

                {studio.activeTemplate === 'winePairing' && (
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={studio.winePairingWine}
                      onChange={(e) => studio.setWinePairingWine(e.target.value)}
                      className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#1b6db5] focus:border-[#1b6db5] outline-none bg-gray-50"
                      placeholder="Wine Name"
                    />
                    <input
                      type="text"
                      value={studio.winePairingFood}
                      onChange={(e) => studio.setWinePairingFood(e.target.value)}
                      className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#1b6db5] focus:border-[#1b6db5] outline-none bg-gray-50"
                      placeholder="Food Name"
                    />
                    <textarea
                      value={studio.winePairingDesc}
                      onChange={(e) => studio.setWinePairingDesc(e.target.value)}
                      rows={4}
                      className="w-full text-sm border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-[#1b6db5] focus:border-[#1b6db5] outline-none resize-none shadow-sm bg-gray-50"
                      placeholder="Description..."
                    />
                  </div>
                )}
              </div>

              <hr className="border-gray-100" />

              {/* 4. Background Color */}
              <div className="flex flex-col gap-4">
                <label className="block text-sm font-bold text-gray-900">4. Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={activeStyle.backgroundColor}
                    onChange={(e) => updateActiveStyle({ backgroundColor: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0.5 bg-white"
                  />
                  <span className="text-sm text-gray-600 font-mono uppercase">
                    {activeStyle.backgroundColor}
                  </span>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* 5. Text Styling (visible when text element is selected) */}
              {selectedElementId === 'text' && (
                <>
                  <div className="flex flex-col gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <label className="block text-sm font-bold text-[#1b6db5]">Text Styling</label>

                    {/* Font family */}
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Font Family</label>
                      <select
                        value={activeStyle.fontFamily}
                        onChange={(e) => updateActiveStyle({ fontFamily: e.target.value })}
                        className="w-full text-sm border border-gray-200 rounded-lg p-2 outline-none bg-white"
                      >
                        <option value="'Oswald', sans-serif">Oswald</option>
                        <option value="'Lato', sans-serif">Lato</option>
                        <option value="'Inter', sans-serif">Inter</option>
                        <option value="'Playfair Display', serif">Playfair Display</option>
                        <option value="'Merriweather', serif">Merriweather</option>
                      </select>
                    </div>

                    {/* Font size */}
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">
                        Font Size ({activeStyle.fontSize}px)
                      </label>
                      <input
                        type="range"
                        min="20"
                        max="120"
                        step="1"
                        value={activeStyle.fontSize}
                        onChange={(e) => updateActiveStyle({ fontSize: parseInt(e.target.value) })}
                        className="w-full accent-[#1b6db5]"
                      />
                    </div>

                    {/* Text color */}
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Text Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={activeStyle.textColor}
                          onChange={(e) => updateActiveStyle({ textColor: e.target.value })}
                          className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                        />
                        <span className="text-xs text-gray-500 uppercase font-mono">
                          {activeStyle.textColor}
                        </span>
                      </div>
                    </div>

                    {/* Alignment + Line height */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">Alignment</label>
                        <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
                          {(['left', 'center', 'right'] as const).map((align) => (
                            <button
                              key={align}
                              onClick={() => updateActiveStyle({ textAlign: align })}
                              className={`flex-1 py-1.5 flex justify-center items-center transition-colors ${
                                activeStyle.textAlign === align
                                  ? 'bg-[#1b6db5] text-white'
                                  : 'text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              {align === 'left' ? (
                                <AlignLeft size={16} />
                              ) : align === 'center' ? (
                                <AlignCenter size={16} />
                              ) : (
                                <AlignRight size={16} />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-gray-600 block mb-1">
                          Line Height ({activeStyle.lineHeight})
                        </label>
                        <input
                          type="range"
                          min="0.8"
                          max="2.5"
                          step="0.1"
                          value={activeStyle.lineHeight}
                          onChange={(e) =>
                            updateActiveStyle({ lineHeight: parseFloat(e.target.value) })
                          }
                          className="w-full accent-[#1b6db5] mt-2"
                        />
                      </div>
                    </div>
                  </div>
                  <hr className="border-gray-100" />
                </>
              )}

              {/* 6. Media & Logos */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-bold text-gray-900">5. Media &amp; Logos</label>
                  <label className="cursor-pointer text-xs flex items-center gap-1.5 text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors">
                    <Upload size={14} />
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        Array.from(e.target.files ?? []).forEach((file) =>
                          studio.addMediaToLibrary(file)
                        );
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  Upload logos or images, then click to add them to the canvas. You can drag them
                  around freely.
                </p>

                {studio.mediaLibrary.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {studio.mediaLibrary.map((media) => (
                      <div
                        key={media.id}
                        onClick={() => studio.addMediaToCanvas(media)}
                        className="aspect-square bg-gray-100 rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#1b6db5] transition-all group relative"
                      >
                        <img
                          src={media.url}
                          alt="Media"
                          className="w-full h-full object-contain p-2"
                        />
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
                    <p className="text-xs text-gray-500 mt-1">
                      Upload logos to place them on the template
                    </p>
                  </div>
                )}

                {/* Selected media controls */}
                {selectedCanvasMediaId && (() => {
                  const selected = studio.canvasMedia.find((m) => m.id === selectedCanvasMediaId);
                  if (!selected) return null;
                  return (
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[#1b6db5]">Selected Media</span>
                        <button
                          onClick={() => {
                            studio.removeCanvasMedia(selectedCanvasMediaId);
                            setSelectedCanvasMediaId(null);
                          }}
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
                        value={selected.scale}
                        onChange={(e) =>
                          studio.updateCanvasMedia(selectedCanvasMediaId, {
                            scale: parseFloat(e.target.value),
                          })
                        }
                        className="w-full accent-[#1b6db5]"
                      />
                      <div className="mt-3">
                        <label className="text-xs text-gray-600 block mb-1">Aspect Ratio</label>
                        <select
                          value={selected.aspectRatio ?? 'auto'}
                          onChange={(e) =>
                            studio.updateCanvasMedia(selectedCanvasMediaId, {
                              aspectRatio: e.target.value,
                            })
                          }
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
                        <label className="text-xs text-gray-600 block mb-1">
                          Layer (Z-Index): {selected.zIndex}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          step="1"
                          value={selected.zIndex}
                          onChange={(e) =>
                            studio.updateCanvasMedia(selectedCanvasMediaId, {
                              zIndex: parseInt(e.target.value),
                            })
                          }
                          className="w-full accent-[#1b6db5]"
                        />
                        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                          <span>Background</span>
                          <span>Foreground</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* ── Canvas Area ──────────────────────────────────────────────────── */}
        <div
          className="flex-grow bg-gray-200 flex items-center justify-center p-8 overflow-auto relative"
          onClick={() => {
            setSelectedCanvasMediaId(null);
            setSelectedElementId(null);
          }}
        >
          <div
            className="relative shadow-2xl bg-white overflow-hidden transition-all duration-300"
            style={{
              width: '486px',
              height: studio.postFormat === 'square' ? '486px' : '607.5px',
            }}
          >
            <div
              ref={canvasRef}
              className={`absolute top-0 left-0 w-[1080px] origin-top-left bg-white overflow-hidden transition-all duration-300 ${
                studio.postFormat === 'square' ? 'h-[1080px]' : 'h-[1350px]'
              }`}
              style={{ transform: 'scale(0.45)' }}
            >
              {/* Base template */}
              {studio.activeTemplate === 'fact' && (
                <TemplateFact
                  text={studio.factText}
                  {...studio.styles.fact}
                  isSelected={selectedElementId === 'text'}
                  onTextClick={() => { setSelectedElementId('text'); setSelectedCanvasMediaId(null); }}
                />
              )}
              {studio.activeTemplate === 'benefits' && (
                <TemplateBenefits
                  items={studio.benefits}
                  {...studio.styles.benefits}
                  isSelected={selectedElementId === 'text'}
                  onTextClick={() => { setSelectedElementId('text'); setSelectedCanvasMediaId(null); }}
                />
              )}
              {studio.activeTemplate === 'title' && (
                <TemplateTitle
                  text={studio.titleText}
                  {...studio.styles.title}
                  isSelected={selectedElementId === 'text'}
                  onTextClick={() => { setSelectedElementId('text'); setSelectedCanvasMediaId(null); }}
                />
              )}
              {studio.activeTemplate === 'numberedList' && (
                <TemplateNumberedList
                  title={studio.numberedListTitle}
                  items={studio.numberedListItems}
                  {...studio.styles.numberedList}
                  isSelected={selectedElementId === 'text'}
                  onTextClick={() => { setSelectedElementId('text'); setSelectedCanvasMediaId(null); }}
                />
              )}
              {studio.activeTemplate === 'event' && (
                <TemplateEvent
                  title={studio.eventTitle}
                  location={studio.eventLocation}
                  dates={studio.eventDates}
                  {...studio.styles.event}
                  isSelected={selectedElementId === 'text'}
                  onTextClick={() => { setSelectedElementId('text'); setSelectedCanvasMediaId(null); }}
                />
              )}
              {studio.activeTemplate === 'quote' && (
                <TemplateQuote
                  text={studio.quoteText}
                  author={studio.quoteAuthor}
                  {...studio.styles.quote}
                  isSelected={selectedElementId === 'text'}
                  onTextClick={() => { setSelectedElementId('text'); setSelectedCanvasMediaId(null); }}
                />
              )}
              {studio.activeTemplate === 'didYouKnow' && (
                <TemplateDidYouKnow
                  text={studio.didYouKnowText}
                  {...studio.styles.didYouKnow}
                  isSelected={selectedElementId === 'text'}
                  onTextClick={() => { setSelectedElementId('text'); setSelectedCanvasMediaId(null); }}
                />
              )}
              {studio.activeTemplate === 'winePairing' && (
                <TemplateWinePairing
                  wine={studio.winePairingWine}
                  food={studio.winePairingFood}
                  description={studio.winePairingDesc}
                  {...studio.styles.winePairing}
                  isSelected={selectedElementId === 'text'}
                  onTextClick={() => { setSelectedElementId('text'); setSelectedCanvasMediaId(null); }}
                />
              )}

              {/* Draggable media layer */}
              {studio.canvasMedia.map((media) => (
                <motion.div
                  key={media.id}
                  drag
                  dragMomentum={false}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCanvasMediaId(media.id);
                    setSelectedElementId(media.id);
                  }}
                  className={`absolute top-0 left-0 cursor-move ${
                    selectedCanvasMediaId === media.id
                      ? 'ring-4 ring-blue-500 ring-offset-4'
                      : ''
                  }`}
                  initial={{ x: media.x, y: media.y, scale: media.scale }}
                  animate={{ scale: media.scale }}
                  style={{ transformOrigin: 'center center', zIndex: media.zIndex }}
                >
                  <img
                    src={media.url}
                    alt="Canvas Media"
                    className="w-64 pointer-events-none"
                    style={{
                      aspectRatio:
                        media.aspectRatio && media.aspectRatio !== 'auto'
                          ? media.aspectRatio
                          : 'auto',
                      objectFit:
                        media.aspectRatio && media.aspectRatio !== 'auto' ? 'cover' : 'contain',
                    }}
                  />
                  {selectedCanvasMediaId === media.id && (
                    <div className="absolute -top-4 -right-4 bg-blue-500 text-white rounded-full p-1 shadow-md">
                      <Move size={16} />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Caption */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex flex-col gap-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-[#1b6db5] flex items-center gap-1.5">
                <MessageSquare size={16} /> Instagram Caption
              </label>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-medium ${
                    studio.caption.length > 2200 ? 'text-red-500' : 'text-gray-500'
                  }`}
                >
                  {studio.caption.length} / 2200
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(studio.caption);
                    showToast('Caption copied to clipboard!', 'success');
                  }}
                  className="text-xs flex items-center gap-1.5 text-gray-600 hover:text-[#1b6db5] font-medium transition-colors bg-gray-100 hover:bg-blue-50 px-3 py-1.5 rounded-full"
                >
                  <Copy size={14} /> Copy
                </button>
              </div>
            </div>
            <textarea
              value={studio.caption}
              onChange={(e) => studio.setCaption(e.target.value)}
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#1b6db5] focus:border-[#1b6db5] outline-none resize-none shadow-sm bg-gray-50"
              placeholder="Write your Instagram caption here... or use AI Generate to create one automatically."
            />
          </div>
        </div>
      </div>

      {/* ── AI Review Modal ───────────────────────────────────────────────── */}
      {reviewFeedback && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl max-h-[80vh] flex flex-col">
            <h3 className="text-lg font-bold text-[#1b6db5] mb-4 flex items-center gap-2">
              <Sparkles size={20} /> AI Design Review
            </h3>
            <div className="overflow-y-auto flex-grow mb-6 pr-2">
              <div className="space-y-4">
                {reviewFeedback.map((check, index) => (
                  <div
                    key={index}
                    className="flex gap-3 items-start border-b border-gray-100 pb-4 last:border-0"
                  >
                    <div
                      className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        check.passed
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {check.passed ? (
                        <span className="text-xs font-bold">✓</span>
                      ) : (
                        <span className="text-xs font-bold">!</span>
                      )}
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

      {/* ── History Modal ─────────────────────────────────────────────────── */}
      {isHistoryOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
              <h3 className="text-xl font-bold text-[#1b6db5] flex items-center gap-2">
                <History size={24} /> Creation History
              </h3>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-grow bg-gray-50">
              {studio.history.length === 0 ? (
                <div className="text-center text-gray-500 py-12 flex flex-col items-center gap-4">
                  <History size={48} className="text-gray-300" />
                  <p>No creations yet. Download a post to save it to your history!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {studio.history.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3 group"
                    >
                      <div className="relative overflow-hidden rounded-lg border border-gray-100 aspect-[4/5] bg-gray-100">
                        <img
                          src={item.url}
                          alt="History item"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button
                            onClick={() => {
                              studio.restoreHistoryItem(item);
                              setIsHistoryOpen(false);
                            }}
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
                          {new Date(item.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
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

      {/* ── Toast notifications ───────────────────────────────────────────── */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
