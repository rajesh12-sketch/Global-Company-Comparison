import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

const apiKey = process.env.API_KEY;

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: apiKey });

// we keep the schema definition to stringify it into the prompt
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
          change: { type: Type.NUMBER, description: "Percentage change, positive or negative" },
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
          date: { type: Type.STRING, description: "YYYY-MM format" },
          revenue: { type: Type.NUMBER, description: "In millions USD" },
          profit: { type: Type.NUMBER, description: "In millions USD" },
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
          marketShareTrend: { type: Type.STRING, enum: ["up", "down", "stable"], description: "Trend of their market share: up, down, or stable" },
          advantage: { type: Type.STRING },
          recentFunding: { type: Type.STRING, description: "E.g. 'Series B - $50M' or 'IPO'" },
          lastEarningsReport: { type: Type.STRING, description: "E.g. 'Q3 2024: beat estimates'" },
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

export const analyzeCompany = async (companyName: string): Promise<AnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your configuration.");
  }

  try {
    // We use gemini-2.5-flash for speed and cost-efficiency with Search Grounding
    // Grounding ensures we get up-to-date news and financial context
    const model = "gemini-2.5-flash";
    
    // We must pass the schema as text in the prompt because responseSchema/responseMimeType 
    // are not supported when using the googleSearch tool.
    // Minify JSON to reduce token count and payload size
    const schemaString = JSON.stringify(analysisSchema);

    const prompt = `
      Act as a senior financial analyst. Provide a comprehensive, real-time data analysis for the company: "${companyName}".
      
      Requirements:
      1. Profile: Accurate corporate details including official website URL.
      2. Metrics: Estimate current Revenue, Net Income, P/E Ratio, and Market Cap. Include recent % changes.
      3. ChartData: Generate 12 data points representing the last 12 months or quarters (labeled appropriately) showing estimated Revenue, Profit, and Stock Price trends based on historical performance.
      4. SWOT: Deep strategic analysis.
      5. Competitors: Top 3 direct competitors. Estimate their market share trend (up/down/stable) based on recent performance. Include details on recent funding or last earnings reports if available.
      6. News: Summarize 3 recent major news events affecting the company.
      7. Executive Summary: A cohesive paragraph describing the company's current outlook.

      OUTPUT INSTRUCTION:
      You must return a valid JSON object matching the schema below. 
      Do not include markdown code blocks (e.g. \`\`\`json). 
      Just return the raw JSON string.

      Schema:
      ${schemaString}
    `;

    // Implement retry logic for transient network/server errors (code 500, xhr error)
    let response;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: {
            // responseMimeType and responseSchema are NOT allowed with googleSearch tool
            tools: [{ googleSearch: {} }], 
          },
        });
        break; // Success
      } catch (err: any) {
        attempts++;
        console.warn(`Gemini API Attempt ${attempts} failed:`, err.message);
        
        // If it's the last attempt, or if it's a permission/key error (usually 403/400), throw immediately
        // We mainly want to retry on 500/503 or network errors
        if (attempts >= maxAttempts || (err.status && err.status < 500 && err.status !== 429)) {
          throw err;
        }
        
        // Exponential backoff: 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts - 1)));
      }
    }

    if (!response) throw new Error("Failed to generate response after multiple attempts.");

    let text = response.text;
    if (!text) throw new Error("No response generated from Gemini.");

    // Robust JSON extraction:
    // 1. Remove markdown code blocks if present
    text = text.replace(/```json/g, '').replace(/```/g, '');
    
    // 2. Find the first '{' and last '}' to strip any preamble or postscript text
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        text = text.substring(firstBrace, lastBrace + 1);
    }

    // 3. Trim whitespace
    text = text.trim();

    const data = JSON.parse(text) as AnalysisResult;

    // Extract grounding metadata if available (source URLs)
    // The googleSearch tool returns grounding metadata with chunks containing web URIs
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sourceUrls: string[] = [];
    
    if (groundingChunks) {
      groundingChunks.forEach(chunk => {
        if (chunk.web?.uri) {
          sourceUrls.push(chunk.web.uri);
        }
      });
    }
    
    // Add unique sources to the result
    data.sourceUrls = [...new Set(sourceUrls)];

    return data;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};