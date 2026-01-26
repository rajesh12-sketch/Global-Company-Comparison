import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ForecastResult } from "../types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    profile: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        ticker: { type: Type.STRING },
        sector: { type: Type.STRING },
        description: { type: Type.STRING },
        ceo: { type: Type.STRING },
        headquarters: { type: Type.STRING },
        founded: { type: Type.STRING },
        website: { type: Type.STRING },
      },
      required: ["name", "ticker", "sector", "description", "website"],
    },
    metrics: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          value: { type: Type.STRING },
          change: { type: Type.NUMBER },
          trend: { type: Type.STRING, enum: ["up", "down", "neutral"] },
        },
        required: ["label", "value", "change", "trend"],
      },
    },
    chartData: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING },
          revenue: { type: Type.NUMBER },
          profit: { type: Type.NUMBER },
          stockPrice: { type: Type.NUMBER },
        },
        required: ["date", "revenue", "profit", "stockPrice"],
      },
    },
    swot: {
      type: Type.OBJECT,
      properties: {
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
        opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
        threats: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["strengths", "weaknesses", "opportunities", "threats"],
    },
    competitors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          marketShare: { type: Type.STRING },
          marketShareTrend: { type: Type.STRING, enum: ["up", "down", "stable"] },
          advantage: { type: Type.STRING },
          recentFunding: { type: Type.STRING },
          lastEarningsReport: { type: Type.STRING },
        },
        required: ["name", "marketShare", "marketShareTrend", "advantage"],
      },
    },
    recentNews: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          source: { type: Type.STRING },
          sentiment: { type: Type.STRING, enum: ["positive", "negative", "neutral"] },
          summary: { type: Type.STRING },
        },
        required: ["title", "source", "sentiment", "summary"],
      },
    },
    executiveSummary: { type: Type.STRING },
  },
  required: ["profile", "metrics", "chartData", "swot", "competitors", "recentNews", "executiveSummary"],
};

const forecastSchema = {
    type: Type.OBJECT,
    properties: {
        companyName: { type: Type.STRING },
        chartData: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    date: { type: Type.STRING },
                    optimistic: { type: Type.NUMBER },
                    neutral: { type: Type.NUMBER },
                    pessimistic: { type: Type.NUMBER }
                },
                required: ["date", "optimistic", "neutral", "pessimistic"]
            }
        },
        analysis: { type: Type.STRING }
    },
    required: ["companyName", "chartData", "analysis"]
};

/**
 * Sanitizes the AI output to ensure it's a valid JSON string.
 */
const cleanJsonResponse = (text: string): string => {
  let cleaned = text.trim();
  // Remove markdown code block markers if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```json\n?/, '').replace(/\n?```$/, '');
  }
  // Try to find the first '{' and last '}' to isolate the JSON object
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return cleaned;
};

export const analyzeCompany = async (companyName: string): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a Senior Investment Strategist. Access the global market dossier for "${companyName}". 
      TASKS:
      1. CRITICAL: Use Google Search to find the most recent available quarterly fiscal reports, current stock price, and top news from the last 30 days.
      2. Construct a detailed SWOT analysis.
      3. Identify 3 primary market competitors.
      4. If real-time data for small or private companies is limited, search for news, funding rounds, or similar sector benchmarks to provide a high-confidence dossier.
      IMPORTANT: Return the response strictly as valid JSON according to the schema provided. No conversational text.`,
      config: { 
        tools: [{ googleSearch: {} }], 
        responseMimeType: "application/json",
        responseSchema: analysisSchema
      },
    });

    const cleanText = cleanJsonResponse(response.text);
    const data = JSON.parse(cleanText) as AnalysisResult;
    
    // Process grounding URLs
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    data.sourceUrls = [...new Set(groundingChunks?.map(c => c.web?.uri).filter(Boolean) as string[])];
    
    return data;
  } catch (error: any) {
    console.error('Gemini Analysis Error:', error);
    throw new Error("Financial analysis engine failed to decrypt data. The company may be too small for real-time tracking or the dossier is restricted.");
  }
};

export const generateForecast = async (companyName: string): Promise<ForecastResult> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Predict 12-month stock price scenarios (Optimistic, Neutral, Pessimistic) for "${companyName}". Use real-time market volatility data from Google Search. Output JSON only.`,
            config: { 
              tools: [{ googleSearch: {} }], 
              responseMimeType: "application/json",
              responseSchema: forecastSchema
            }
        });
        
        const cleanText = cleanJsonResponse(response.text);
        return JSON.parse(cleanText) as ForecastResult;
    } catch (error: any) {
        console.error('Gemini Forecast Error:', error);
        throw new Error("AI forecast engine currently offline. Market volatility exceeds simulation bounds.");
    }
};