import { AnalysisResult, ForecastResult } from "../types.ts";

export const analyzeCompany = async (companyName: string): Promise<AnalysisResult> => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyName }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.details || 'Analysis failed');
    }

    const { data, sourceUrls } = result;
    return { ...data, sourceUrls };
  } catch (error: any) {
    console.error('Gemini Analysis Error:', error);
    throw error;
  }
};

export const generateForecast = async (companyName: string): Promise<ForecastResult> => {
  try {
    const response = await fetch('/api/forecast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyName }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Forecast failed');
    }

    return result;
  } catch (error: any) {
    console.error('Gemini Forecast Error:', error);
    throw error;
  }
};

