import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, ForecastResult } from "../types";

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
          stockPrice: { type: Type.NUMBER, description: "Price in USD (converted if necessary)" },
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

const forecastSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        companyName: { type: Type.STRING },
        chartData: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    date: { type: Type.STRING, description: "YYYY-MM format (future)" },
                    optimistic: { type: Type.NUMBER },
                    neutral: { type: Type.NUMBER },
                    pessimistic: { type: Type.NUMBER }
                },
                required: ["date", "optimistic", "neutral", "pessimistic"]
            }
        },
        analysis: { type: Type.STRING, description: "Explanation of the forecast drivers and scenarios" }
    },
    required: ["companyName", "chartData", "analysis"]
};

// Centralized error handling helper
const handleGeminiError = (error: any): never => {
    console.error("Gemini API Error:", error);
    let message = "An unexpected error occurred during analysis.";

    const errStr = error.toString().toLowerCase();
    const errMsg = error.message?.toLowerCase() || "";

    if (errStr.includes("api key") || errMsg.includes("api key")) {
        message = "Configuration Error: API Key is invalid or missing. Please check your settings.";
    } else if (errMsg.includes("429") || errMsg.includes("quota")) {
        message = "Usage Limit Reached: We're experiencing high traffic. Please wait a minute and try again.";
    } else if (errMsg.includes("503") || errMsg.includes("overloaded")) {
        message = "Service Busy: The AI model is currently overloaded. Please try again in a few moments.";
    } else if (errMsg.includes("safety") || errMsg.includes("blocked")) {
        message = "Content Filtered: The analysis was blocked by safety settings. Try searching for a different company.";
    } else if (errMsg.includes("fetch failed") || errMsg.includes("network")) {
        message = "Connection Error: Unable to reach the server. Please check your internet connection.";
    } else if (errMsg.includes("not found")) {
        message = "Company Not Found: We couldn't locate data for this specific company. Try the full official name.";
    } else if (errMsg.includes("syntaxerror") || errMsg.includes("json")) {
        message = "Data Parsing Error: The AI returned an invalid format. Please try running the analysis again.";
    }

    throw new Error(message);
};

export const analyzeCompany = async (companyName: string): Promise<AnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your configuration.");
  }

  try {
    const model = "gemini-2.5-flash";
    const schemaString = JSON.stringify(analysisSchema);

    const prompt = `
      Act as a senior financial analyst. Provide a comprehensive, real-time data analysis for the company: "${companyName}".
      
      Requirements:
      1. Profile: Accurate corporate details including official website URL.
      2. Metrics: Estimate current Revenue, Net Income, P/E Ratio, and Market Cap. Include recent % changes.
      3. ChartData: Generate 12 data points representing the last 12 months or quarters (labeled appropriately) showing estimated Revenue, Profit, and Stock Price trends based on historical performance. 
         IMPORTANT: Convert all currency values (Revenue, Profit, Stock Price) to USD for consistency, even if the company is international.
      4. SWOT: Deep strategic analysis.
      5. Competitors: Top 3 direct competitors. Estimate their market share trend (up/down/stable) based on recent performance. Include details on recent funding or last earnings reports if available.
      6. News: Summarize 3 recent major news events affecting the company.
      7. Executive Summary: A cohesive paragraph describing the company's current outlook.

      OUTPUT INSTRUCTION:
      You must return a valid JSON object matching the schema below. 
      Ensure there are NO trailing commas.
      Do not include markdown code blocks (e.g. \`\`\`json). 
      Just return the raw JSON string.

      Schema:
      ${schemaString}
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], 
      },
    });

    let text = response.text || "";
    text = cleanJsonText(text);

    const data = JSON.parse(text) as AnalysisResult;

    // Sanitize data to prevent undefined array errors
    if (!data.metrics) data.metrics = [];
    if (!data.chartData) data.chartData = [];
    if (!data.competitors) data.competitors = [];
    if (!data.recentNews) data.recentNews = [];
    
    if (!data.swot) {
        data.swot = { strengths: [], weaknesses: [], opportunities: [], threats: [] };
    } else {
        if (!data.swot.strengths) data.swot.strengths = [];
        if (!data.swot.weaknesses) data.swot.weaknesses = [];
        if (!data.swot.opportunities) data.swot.opportunities = [];
        if (!data.swot.threats) data.swot.threats = [];
    }

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sourceUrls: string[] = [];
    if (groundingChunks) {
      groundingChunks.forEach(chunk => {
        if (chunk.web?.uri) {
          sourceUrls.push(chunk.web.uri);
        }
      });
    }
    data.sourceUrls = [...new Set(sourceUrls)];

    return data;

  } catch (error) {
    handleGeminiError(error);
  }
};

export const generateForecast = async (companyName: string): Promise<ForecastResult> => {
    if (!apiKey) throw new Error("API Key missing");

    try {
        const schemaString = JSON.stringify(forecastSchema);
        const prompt = `
            Act as a financial forecaster. Generate a 12-month stock price forecast for "${companyName}" with three scenarios: Optimistic (Bull case), Neutral (Base case), and Pessimistic (Bear case).
            
            Requirements:
            1. Start from the current approximate market price (in USD).
            2. Provide 12 monthly data points for the future.
            3. Provide a brief analysis explaining the drivers for these scenarios (e.g., pending regulation, product launches, market conditions).

            OUTPUT INSTRUCTION:
            Return valid JSON matching the schema below. No markdown.
            Ensure there are NO trailing commas.

            Schema:
            ${schemaString}
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                 tools: [{ googleSearch: {} }] // Use search to get current price and relevant future events
            }
        });

        let text = response.text || "";
        text = cleanJsonText(text);
        const result = JSON.parse(text) as ForecastResult;
        
        // Sanitize forecast data
        if (!result.chartData) result.chartData = [];
        
        return result;
    } catch (error) {
        handleGeminiError(error);
    }
};

// Helper to clean JSON string from LLM response
function cleanJsonText(text: string): string {
    text = text.replace(/```json/g, '').replace(/```/g, '');
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        text = text.substring(firstBrace, lastBrace + 1);
    }
    // Remove trailing commas to prevent JSON.parse errors
    // Regex: Match a comma, followed by optional whitespace, followed by a closing brace or bracket.
    // Replace with just the closing brace/bracket (stripping the comma).
    text = text.replace(/,(\s*[}\]])/g, '$1');
    
    return text.trim();
}