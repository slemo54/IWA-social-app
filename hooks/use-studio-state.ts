'use client';

import { useState } from 'react';

export type TemplateType =
  | 'fact'
  | 'benefits'
  | 'title'
  | 'numberedList'
  | 'event'
  | 'quote'
  | 'didYouKnow'
  | 'winePairing';

export type PostFormat = 'square' | 'portrait';

export interface BenefitItem {
  icon: string;
  text: string;
}

export interface TemplateStyle {
  fontSize: number;
  fontFamily: string;
  textColor: string;
  backgroundColor: string;
  textAlign: string;
  lineHeight: number;
  accentColor?: string;
  numberColor?: string;
}

export interface MediaFile {
  id: string;
  url: string;
}

export interface CanvasMedia {
  id: string;
  url: string;
  x: number;
  y: number;
  scale: number;
  aspectRatio?: string;
  zIndex: number;
  opacity?: number;
}

export interface HistoryItem {
  id: string;
  url: string;
  timestamp: number;
  state: {
    activeTemplate: TemplateType;
    postFormat: PostFormat;
    factText: string;
    benefits: BenefitItem[];
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
    factStyle: TemplateStyle;
    benefitsStyle: TemplateStyle;
    titleStyle: TemplateStyle;
    numberedListStyle: TemplateStyle;
    eventStyle: TemplateStyle;
    quoteStyle: TemplateStyle;
    didYouKnowStyle: TemplateStyle;
    winePairingStyle: TemplateStyle;
    canvasMedia: CanvasMedia[];
    caption: string;
  };
}

// ─── Default styles ──────────────────────────────────────────────────────────
const DEFAULT_STYLES: Record<TemplateType, TemplateStyle> = {
  fact: {
    fontSize: 55,
    fontFamily: "'Oswald', sans-serif",
    textColor: '#1a3b5c',
    backgroundColor: '#1b6db5',
    textAlign: 'center',
    lineHeight: 1.2,
  },
  benefits: {
    fontSize: 55,
    fontFamily: "'Lato', sans-serif",
    textColor: '#ffffff',
    backgroundColor: '#1b6db5',
    textAlign: 'left',
    lineHeight: 1.2,
  },
  title: {
    fontSize: 120,
    fontFamily: "'Oswald', sans-serif",
    textColor: '#ffffff',
    backgroundColor: '#1b6db5',
    textAlign: 'center',
    lineHeight: 1.1,
  },
  numberedList: {
    fontSize: 45,
    fontFamily: "'Lato', sans-serif",
    textColor: '#ffffff',
    backgroundColor: '#9c824a',
    textAlign: 'left',
    lineHeight: 1.2,
    numberColor: '#ffffff',
  },
  event: {
    fontSize: 65,
    fontFamily: "'Oswald', sans-serif",
    textColor: '#ffffff',
    backgroundColor: '#1b6db5',
    textAlign: 'left',
    lineHeight: 1.2,
    accentColor: '#c5a86a',
  },
  quote: {
    fontSize: 55,
    fontFamily: "'Playfair Display', serif",
    textColor: '#ffffff',
    backgroundColor: '#1a3a6b',
    textAlign: 'center',
    lineHeight: 1.4,
    accentColor: '#c8a96e',
  },
  didYouKnow: {
    fontSize: 60,
    fontFamily: "'Inter', sans-serif",
    textColor: '#1a3a6b',
    backgroundColor: '#e8f0f7',
    textAlign: 'center',
    lineHeight: 1.3,
    accentColor: '#c8a96e',
  },
  winePairing: {
    fontSize: 45,
    fontFamily: "'Inter', sans-serif",
    textColor: '#1a3a6b',
    backgroundColor: '#ffffff',
    textAlign: 'center',
    lineHeight: 1.4,
    accentColor: '#c8a96e',
  },
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useStudioState() {
  // Layout
  const [activeTemplate, setActiveTemplate] = useState<TemplateType>('fact');
  const [postFormat, setPostFormat] = useState<PostFormat>('portrait');

  // Per-template styles
  const [styles, setStyles] = useState<Record<TemplateType, TemplateStyle>>(DEFAULT_STYLES);

  // Content
  const [factText, setFactText] = useState(
    '1. MOSCATO BIANCO IS ASSOCIATED WITH THE ASTI REGION WHERE IT IS MADE INTO GENTLY SPARKLING AROMATIC SWEET WINES.'
  );
  const [benefits, setBenefits] = useState<BenefitItem[]>([
    { icon: 'award', text: 'International Certification' },
    { icon: 'check', text: 'Professional Qualification' },
    { icon: 'message', text: 'Shared Wine Language' },
    { icon: 'compass', text: 'Learning Support' },
    { icon: 'globe', text: 'Network and community' },
    { icon: 'grape', text: 'More than just wine' },
  ]);
  const [titleText, setTitleText] = useState('IWA\nPOST\n4:5\nCOMPLETO');
  const [numberedListTitle, setNumberedListTitle] = useState(
    '5 REASONS WHY\nYOU SHOULD JOIN OUR\nChampagne Specialist\nCOURSE'
  );
  const [numberedListItems, setNumberedListItems] = useState([
    'It is one of the most technical and fascinating wines in the world.',
    'Understanding how Champagne is made allows you to appreciate all sparkling wines more',
    'You can immerse yourself in the luxurious Champagne lifestyle, even if only for a few days',
    'Champagne is culture, terroir, history, and prestige.',
    'You can rave about it... but with knowledge.',
  ]);
  const [eventTitle, setEventTitle] = useState('Champagne Specialist');
  const [eventDates, setEventDates] = useState(['14 - 15 November 2025', '28 - 29 November 2025']);
  const [eventLocation, setEventLocation] = useState('Italian Wine Academy, Verona');
  const [quoteText, setQuoteText] = useState(
    'Wine is the most healthful and most hygienic of beverages.'
  );
  const [quoteAuthor, setQuoteAuthor] = useState('Louis Pasteur');
  const [didYouKnowText, setDidYouKnowText] = useState(
    'Italy has over 400 native grape varieties, making it the country with the greatest diversity of wine grapes in the world.'
  );
  const [winePairingWine, setWinePairingWine] = useState('Chianti Classico');
  const [winePairingFood, setWinePairingFood] = useState('Bistecca alla Fiorentina');
  const [winePairingDesc, setWinePairingDesc] = useState(
    'The high acidity and tannins of Sangiovese cut through the rich, fatty protein of the steak perfectly.'
  );
  const [caption, setCaption] = useState('');
  const [topic, setTopic] = useState('');

  // Media
  const [mediaLibrary, setMediaLibrary] = useState<MediaFile[]>([
    { id: 'logo-iwa', url: 'https://placehold.co/400x400/1b6db5/ffffff/png?text=IWA+Logo' },
    { id: 'logo-wset', url: 'https://placehold.co/600x200/ffffff/1b6db5/png?text=WSET+Provider' },
    { id: 'logo-ais', url: 'https://placehold.co/400x400/ffffff/1b6db5/png?text=AIS+FVG' },
    {
      id: 'logo-champagne',
      url: 'https://placehold.co/400x400/c5a86a/000000/png?text=Champagne+Edu',
    },
  ]);
  const [canvasMedia, setCanvasMedia] = useState<CanvasMedia[]>([]);

  // History
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // ── Style helpers ──────────────────────────────────────────────────────────
  const activeStyle = styles[activeTemplate];

  const updateActiveStyle = (patch: Partial<TemplateStyle>) => {
    setStyles((prev) => ({
      ...prev,
      [activeTemplate]: { ...prev[activeTemplate], ...patch },
    }));
  };

  // ── Media helpers ──────────────────────────────────────────────────────────
  const addMediaToLibrary = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaLibrary((prev) => [
        ...prev,
        {
          id: Date.now().toString() + Math.random().toString(36).substring(7),
          url: reader.result as string,
        },
      ]);
    };
    reader.readAsDataURL(file);
  };

  const addMediaToCanvas = (media: MediaFile) => {
    setCanvasMedia((prev) => [
      ...prev,
      { id: Date.now().toString(), url: media.url, x: 100, y: 100, scale: 1, aspectRatio: 'auto', zIndex: 25 },
    ]);
  };

  const removeCanvasMedia = (id: string) => setCanvasMedia((prev) => prev.filter((m) => m.id !== id));

  const updateCanvasMedia = (id: string, patch: Partial<CanvasMedia>) => {
    setCanvasMedia((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  // ── Snapshot for history ───────────────────────────────────────────────────
  const buildSnapshot = () => ({
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
    factStyle: styles.fact,
    benefitsStyle: styles.benefits,
    titleStyle: styles.title,
    numberedListStyle: styles.numberedList,
    eventStyle: styles.event,
    quoteStyle: styles.quote,
    didYouKnowStyle: styles.didYouKnow,
    winePairingStyle: styles.winePairing,
    canvasMedia,
    caption,
  });

  const pushHistory = (url: string) => {
    const timestamp = Date.now();
    setHistory((prev) => [{ id: timestamp.toString(), url, timestamp, state: buildSnapshot() }, ...prev]);
  };

  const restoreHistoryItem = (item: HistoryItem) => {
    const s = item.state;
    setActiveTemplate(s.activeTemplate);
    setPostFormat(s.postFormat ?? 'portrait');
    setFactText(s.factText);
    setBenefits(s.benefits);
    setTitleText(s.titleText);
    setNumberedListTitle(s.numberedListTitle);
    setNumberedListItems(s.numberedListItems);
    setEventTitle(s.eventTitle);
    setEventDates(s.eventDates);
    setEventLocation(s.eventLocation);
    setQuoteText(s.quoteText ?? '');
    setQuoteAuthor(s.quoteAuthor ?? '');
    setDidYouKnowText(s.didYouKnowText ?? '');
    setWinePairingWine(s.winePairingWine ?? '');
    setWinePairingFood(s.winePairingFood ?? '');
    setWinePairingDesc(s.winePairingDesc ?? '');
    setCaption(s.caption ?? '');
    setCanvasMedia(s.canvasMedia);
    setStyles({
      fact: { ...DEFAULT_STYLES.fact, ...s.factStyle },
      benefits: { ...DEFAULT_STYLES.benefits, ...s.benefitsStyle },
      title: { ...DEFAULT_STYLES.title, ...s.titleStyle },
      numberedList: { ...DEFAULT_STYLES.numberedList, ...s.numberedListStyle },
      event: { ...DEFAULT_STYLES.event, ...s.eventStyle },
      quote: { ...DEFAULT_STYLES.quote, ...s.quoteStyle },
      didYouKnow: { ...DEFAULT_STYLES.didYouKnow, ...s.didYouKnowStyle },
      winePairing: { ...DEFAULT_STYLES.winePairing, ...s.winePairingStyle },
    });
  };

  return {
    // layout
    activeTemplate, setActiveTemplate,
    postFormat, setPostFormat,
    // styles
    styles, activeStyle, updateActiveStyle,
    // content
    topic, setTopic,
    caption, setCaption,
    factText, setFactText,
    benefits, setBenefits,
    titleText, setTitleText,
    numberedListTitle, setNumberedListTitle,
    numberedListItems, setNumberedListItems,
    eventTitle, setEventTitle,
    eventDates, setEventDates,
    eventLocation, setEventLocation,
    quoteText, setQuoteText,
    quoteAuthor, setQuoteAuthor,
    didYouKnowText, setDidYouKnowText,
    winePairingWine, setWinePairingWine,
    winePairingFood, setWinePairingFood,
    winePairingDesc, setWinePairingDesc,
    // media
    mediaLibrary, addMediaToLibrary, addMediaToCanvas,
    canvasMedia, removeCanvasMedia, updateCanvasMedia,
    // history
    history, pushHistory, restoreHistoryItem,
  };
}
