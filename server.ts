import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Schemas
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

app.post("/api/analyze", async (req, res) => {
  const { companyName } = req.body;
  if (!companyName) {
    return res.status(400).json({ error: "Company name is required" });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ 
      error: "Gemini API key is missing. Please use the 'Select API Key' button in the app or ensure GEMINI_API_KEY is set in your environment variables." 
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
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
        responseSchema: analysisSchema as any
      },
    });

    const text = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sourceUrls = [...new Set(groundingChunks?.map(c => c.web?.uri).filter(Boolean) as string[])];
    const analysisData = JSON.parse(text || "{}");

    res.json({ data: analysisData, sourceUrls });
  } catch (error: any) {
    console.error('Gemini Analysis Error:', error);
    res.status(500).json({ 
      error: error.message || "Analysis failed",
      details: error.toString()
    });
  }
});

app.post("/api/forecast", async (req, res) => {
  const { companyName } = req.body;
  if (!companyName) {
    return res.status(400).json({ error: "Company name is required" });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Gemini API key is missing. Please use the 'Select API Key' button in the app." });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Predict 12-month stock price scenarios (Optimistic, Neutral, Pessimistic) for "${companyName}". Use real-time market volatility data from Google Search. Output JSON only.`,
      config: { 
        tools: [{ googleSearch: {} }], 
        responseMimeType: "application/json",
        responseSchema: forecastSchema as any
      }
    });
    
    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error('Gemini Forecast Error:', error);
    res.status(500).json({ error: error.message || "Forecast failed" });
  }
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static("dist"));
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
