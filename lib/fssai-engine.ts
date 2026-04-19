import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
});

export interface FSSAIViolation {
  severity: 'critical' | 'major' | 'minor';
  parameter: string;
  category: string;
  fssaiReference: string;
  observation: string;
  remediation: string;
  estimatedCost: number;
  fixTimeline: string;
}

export interface FSSAICategoryScore {
  name: string;
  score: number;
  totalParameters: number;
  compliantCount: number;
}

export interface AuditReport {
  overallScore: number;
  riskLevel: string;
  summary: string;
  confidenceLevel: number;
  estimatedTotalFixCostInr: number;
  estimatedFixTimeline: string;
  categories: FSSAICategoryScore[];
  violations: FSSAIViolation[];
  compliantAreas: string[];
}

export const FSSAI_PARAMETERS = {
  PREMISES_SURROUNDINGS: ["Floor", "Walls/ceiling", "Ventilation/lighting", "Pest control", "Waste disposal"],
  FOOD_STORAGE_HANDLING: ["Raw-cooked separation", "Sealed containers", "Cold storage", "FIFO/labeling", "Food contact surfaces"],
  LAYOUT_EQUIPMENT: ["Workflow", "Equipment maintenance", "Refrigeration", "Handwash station", "Utensil storage"],
  PERSONAL_HYGIENE_PPE: ["Head covers", "Gloves/apron", "Clean uniforms", "No jewelry"],
  CLEANING_DOCUMENTATION: ["Cleaning schedule", "Sanitizer", "FSSAI license displayed", "Orderliness"]
};

export async function analyzeKitchen(base64Image: string, mimeType: string): Promise<AuditReport> {
  const prompt = `You are an expert FSSAI (Food Safety and Standards Authority of India) food safety inspector. 
Your task is to conduct a detailed kitchen audit according to Schedule 4 of FSSAI Food Safety Management System (FSMS).

Evaluate the provided image against exactly 23 parameters across 5 categories:
1. PREMISES_SURROUNDINGS (5 items): Floor, Walls/ceiling, Ventilation/lighting, Pest control, Waste disposal
2. FOOD_STORAGE_HANDLING (5 items): Raw-cooked separation, Sealed containers, Cold storage, FIFO/labeling, Food contact surfaces
3. LAYOUT_EQUIPMENT (5 items): Workflow, Equipment maintenance, Refrigeration, Handwash station, Utensil storage
4. PERSONAL_HYGIENE_PPE (4 items): Head covers, Gloves/apron, Clean uniforms, No jewelry
5. CLEANING_DOCUMENTATION (4 items): Cleaning schedule, Sanitizer, FSSAI license displayed, Orderliness

INSTRUCTIONS:
- Only evaluate what is clearly visible in the image.
- Mark parameters not clearly seen as non-violating unless there's indicative evidence.
- Score each category from 0-100.
- Calculate an overall_score (0-100).
- Assign a risk_level: 90-100 Excellent, 75-89 Good, 50-74 Fair, 25-49 Poor, 0-24 Critical.
- Provide specific observations and FSSAI reference numbers for each violation.
- Estimate remediation cost in INR (₹) and a realistic timeline for fixing each violation.
- If no violations are found, highlight "Compliant Areas".

Return ONLY raw JSON matching this structure:
{
  "overallScore": number,
  "riskLevel": string,
  "summary": string,
  "confidenceLevel": number,
  "estimatedTotalFixCostInr": number,
  "estimatedFixTimeline": string,
  "categories": [
    { "name": string, "score": number, "totalParameters": number, "compliantCount": number }
  ],
  "violations": [
    {
      "severity": "critical"|"major"|"minor",
      "parameter": string,
      "category": string,
      "fssaiReference": string,
      "observation": string,
      "remediation": string,
      "estimatedCost": number,
      "fixTimeline": string
    }
  ],
  "compliantAreas": [string]
}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash", // Using requested 2.0 Flash
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Image.split(',')[1] || base64Image
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    if (!response.text) {
      throw new Error("Empty response from AI engine");
    }

    // Process and parse JSON
    const cleanJson = response.text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleanJson) as AuditReport;
    return result;
  } catch (error) {
    console.error("FSSAI Engine Error:", error);
    throw error;
  }
}
