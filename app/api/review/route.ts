import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Missing imageBase64 parameter' }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: 'image/png',
            },
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
              
              Return ONLY the raw JSON array, without markdown formatting or code blocks.`,
          },
        ],
      },
    });

    if (!response.text) {
      return NextResponse.json({ error: 'Empty AI response' }, { status: 500 });
    }

    const jsonStr = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    const feedback = JSON.parse(jsonStr);
    return NextResponse.json(feedback);
  } catch (err) {
    console.error('[/api/review]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
