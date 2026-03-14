import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { template, topic } = await req.json();

    if (!template) {
      return NextResponse.json({ error: 'Missing template parameter' }, { status: 400 });
    }

    const basePrompt = topic
      ? `Focus specifically on the topic: "${topic}". `
      : `Focus on Italian wine, WSET certification, grape varieties, regions, or wine pairings. `;

    const captionPrompt = `Also generate a highly engaging Instagram caption for this post. Include relevant emojis and hashtags (like #italianwine #wset #winelovers #italianwineacademy). Keep the caption under 2200 characters.`;

    const prompts: Record<string, string> = {
      fact: `${basePrompt} Generate a short, interesting fact about wine. It should be 1-2 sentences. ${captionPrompt} Return the result as a JSON object with "fact" (string) and "caption" (string).`,
      benefits: `${basePrompt} Generate a list of 6 benefits of taking a wine certification course or learning about this topic. Keep each benefit to 2-4 words. ${captionPrompt} Return the result as a JSON object with "benefits" (array of 6 strings) and "caption" (string).`,
      title: `${basePrompt} Generate a catchy, short title for a wine course or event. Maximum 5 words. ${captionPrompt} Return the result as a JSON object with "title" (string) and "caption" (string).`,
      numberedList: `${basePrompt} Generate a title and a list of 5 key points/regions/facts. ${captionPrompt} Return the result as a JSON object with "title" (string), "items" (array of 5 strings), and "caption" (string).`,
      event: `${basePrompt} Generate details for a wine tasting or educational event. Include a catchy title (max 4 words), 2 dates (e.g. "14 - 15 November 2025"), and a location in Italy. ${captionPrompt} Return the result as a JSON object with "title" (string), "dates" (array of 2 strings), "location" (string), and "caption" (string).`,
      quote: `${basePrompt} Generate a famous or inspiring quote about wine. ${captionPrompt} Return the result as a JSON object with "quote" (string), "author" (string), and "caption" (string).`,
      didYouKnow: `${basePrompt} Generate a surprising "Did you know?" fact about wine. ${captionPrompt} Return the result as a JSON object with "fact" (string) and "caption" (string).`,
      winePairing: `${basePrompt} Generate a perfect wine and food pairing. Include the wine name, the food name, and a 1-2 sentence description of why they pair well. ${captionPrompt} Return the result as a JSON object with "wine" (string), "food" (string), "description" (string), and "caption" (string).`,
    };

    const prompt = prompts[template];
    if (!prompt) {
      return NextResponse.json({ error: 'Unknown template' }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    if (!response.text) {
      return NextResponse.json({ error: 'Empty AI response' }, { status: 500 });
    }

    const data = JSON.parse(response.text);
    return NextResponse.json(data);
  } catch (err) {
    console.error('[/api/generate]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
