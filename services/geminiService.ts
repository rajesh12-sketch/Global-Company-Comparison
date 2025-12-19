
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, ForecastResult } from "../types";

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey });

const analysisSchema: Schema = {
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

const forecastSchema: Schema = {
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

export const analyzeCompany = async (companyName: string): Promise<AnalysisResult> => {
  if (!apiKey) throw new Error("API Key missing.");

  try {
    const model = "gemini-3-flash-preview";
    const prompt = `
      Act as a Lead Financial Analyst. Produce a complete real-time intelligence briefing for "${companyName}".
      Use Google Search to verify latest fiscal reports, news, and stock prices.
      Return JSON only.
      
      Schema: ${JSON.stringify(analysisSchema)}
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" },
    });

    const data = JSON.parse(response.text) as AnalysisResult;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    data.sourceUrls = [...new Set(groundingChunks?.map(c => c.web?.uri).filter(Boolean) as string[])];

    return data;
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message || "Analysis failure.");
  }
};

export const generateForecast = async (companyName: string): Promise<ForecastResult> => {
    if (!apiKey) throw new Error("API Key missing.");

    try {
        const model = "gemini-3-flash-preview";
        const prompt = `
            Forecast 12-month stock price scenarios for "${companyName}". 
            Include optimistic, base, and pessimistic outcomes.
            Return JSON only.
            
            Schema: ${JSON.stringify(forecastSchema)}
        `;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
        });

        return JSON.parse(response.text) as ForecastResult;
    } catch (error: any) {
        console.error(error);
        throw new Error("Forecast engine offline.");
    }
};
