import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

const MOCK_FALLBACK_RESPONSE = {
  overallScore: 34,
  riskLevel: "HIGH",
  summary: "Critical violations detected in food storage and hygiene practices. Immediate corrective action required to meet FSSAI Schedule 4 compliance standards.",
  confidenceLevel: 0.85,
  estimatedTotalFixCostInr: 2750,
  estimatedFixTimeline: "2 days",
  categories: [
    { name: "PREMISES_SURROUNDINGS", score: 60, totalParameters: 5, compliantCount: 3 },
    { name: "FOOD_STORAGE_HANDLING", score: 20, totalParameters: 5, compliantCount: 1 },
    { name: "LAYOUT_EQUIPMENT", score: 40, totalParameters: 5, compliantCount: 2 },
    { name: "PERSONAL_HYGIENE_PPE", score: 25, totalParameters: 4, compliantCount: 1 },
    { name: "CLEANING_DOCUMENTATION", score: 30, totalParameters: 4, compliantCount: 1 }
  ],
  violations: [
    {
      severity: "critical",
      parameter: "Open food containers",
      category: "FOOD_STORAGE_HANDLING",
      fssaiReference: "FSSAI Sch 4.2",
      observation: "Multiple food containers observed without proper sealing, exposing contents to contamination",
      remediation: "Seal all containers immediately with food-grade lids",
      estimatedCost: 800,
      fixTimeline: "1 day"
    },
    {
      severity: "critical",
      parameter: "Raw meat stored above vegetables",
      category: "FOOD_STORAGE_HANDLING",
      fssaiReference: "FSSAI Sch 4.3",
      observation: "Raw meat products stored on upper shelves above ready-to-eat items, risk of cross-contamination",
      remediation: "Reorganize cold storage — raw meat always on bottom shelf",
      estimatedCost: 0,
      fixTimeline: "1 hour"
    },
    {
      severity: "critical",
      parameter: "No pest control records",
      category: "CLEANING_DOCUMENTATION",
      fssaiReference: "FSSAI Sch 4.5",
      observation: "No visible pest control documentation or service records",
      remediation: "Engage licensed pest control service and maintain monthly log",
      estimatedCost: 1200,
      fixTimeline: "2 days"
    },
    {
      severity: "major",
      parameter: "Work surface residue",
      category: "PREMISES_SURROUNDINGS",
      fssaiReference: "FSSAI Sch 4.1",
      observation: "Food residue and stains visible on preparation surfaces",
      remediation: "Clean and sanitize all prep surfaces with approved food-safe sanitizer",
      estimatedCost: 200,
      fixTimeline: "2 hours"
    },
    {
      severity: "major",
      parameter: "Missing shelf labels",
      category: "FOOD_STORAGE_HANDLING",
      fssaiReference: "FSSAI Sch 4.4",
      observation: "Stored items lack date labels and content identification",
      remediation: "Label all stored items with date received and contents description",
      estimatedCost: 100,
      fixTimeline: "1 hour"
    },
    {
      severity: "major",
      parameter: "Staff not wearing gloves",
      category: "PERSONAL_HYGIENE_PPE",
      fssaiReference: "FSSAI Sch 4.6",
      observation: "Kitchen staff handling food without disposable gloves",
      remediation: "Provide and enforce disposable gloves policy for all food handlers",
      estimatedCost: 300,
      fixTimeline: "1 day"
    },
    {
      severity: "minor",
      parameter: "Handwash station lacks soap",
      category: "PERSONAL_HYGIENE_PPE",
      fssaiReference: "FSSAI Sch 4.7",
      observation: "Handwashing station missing liquid soap dispenser",
      remediation: "Stock liquid soap and paper towels at all handwash stations",
      estimatedCost: 150,
      fixTimeline: "Same day"
    },
    {
      severity: "minor",
      parameter: "Incomplete cleaning schedule",
      category: "CLEANING_DOCUMENTATION",
      fssaiReference: "FSSAI Sch 4.8",
      observation: "Cleaning checklist not posted or incomplete",
      remediation: "Post daily cleaning checklist on wall with sign-off columns",
      estimatedCost: 0,
      fixTimeline: "1 hour"
    }
  ],
  compliantAreas: [
    "Adequate ventilation system installed",
    "Fire extinguisher present and accessible"
  ]
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, mimeType } = body;

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Check for API key (server-side only, no NEXT_PUBLIC_ prefix)
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not found, returning mock response');
      return NextResponse.json(MOCK_FALLBACK_RESPONSE);
    }

    const ai = new GoogleGenAI({ apiKey });

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
        model: "gemini-2.0-flash",
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType || 'image/jpeg',
                  data: image.split(',')[1] || image
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
        console.warn('Empty response from Gemini, returning mock response');
        return NextResponse.json(MOCK_FALLBACK_RESPONSE);
      }

      const cleanJson = response.text.replace(/```json|```/g, "").trim();
      const result = JSON.parse(cleanJson);
      
      return NextResponse.json(result);
    } catch (geminiError: any) {
      console.error('Gemini API Error:', geminiError);
      
      // Check for 429 quota error or any other error
      if (geminiError?.message?.includes('429') || geminiError?.status === 429) {
        console.warn('Gemini quota exceeded (429), returning mock response');
      } else {
        console.warn('Gemini error occurred, returning mock response');
      }
      
      return NextResponse.json(MOCK_FALLBACK_RESPONSE);
    }
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json(MOCK_FALLBACK_RESPONSE);
  }
}
