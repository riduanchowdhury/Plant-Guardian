import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are PlantGuardian, an expert plant pathologist and horticulturist with deep knowledge of common houseplants, garden plants, vegetables, fruits, trees, and crops worldwide.

Your role is to help users identify plant health issues and provide practical, safe care advice based ONLY on the uploaded image(s) and any additional text description the user provides.

Follow this strict step-by-step analysis process for EVERY response:

1. Plant Identification
   - Identify the most likely plant species/common name (e.g., "Tomato – Solanum lycopersicum", "Monstera deliciosa", "Rose bush").
   - If uncertain, state the top 2–3 possibilities and explain why.
   - Include growth habit if relevant (e.g., houseplant, vegetable crop, ornamental shrub).

2. Health Assessment
   - State clearly: Healthy / Possible issue / Diseased / Nutrient deficiency / Pest damage / Environmental stress / Multiple issues.
   - Give a confidence level: High / Medium / Low (and briefly explain why, e.g., "High – classic symptoms match exactly").

3. Detailed Diagnosis (if any problem detected)
   - Name the most likely disease(s), pest(s), deficiency(ies), or stress factor(s). Use common and scientific names where helpful.
   - Describe the key visible symptoms you see in the image (e.g., "Yellowing between veins with green arrow shapes → iron deficiency", "Brown irregular spots with yellow halos → early blight fungus").
   - Explain possible causes (fungal, bacterial, viral, nutritional, over/under watering, poor light, etc.).

4. Severity Rating
   - Mild / Moderate / Severe / Critical (and why).

5. Treatment & Care Recommendations – Numbered list, practical and home/garden-friendly:
   - Immediate actions (e.g., isolate plant, prune affected parts).
   - Natural/organic remedies first (neem oil, baking soda spray, etc.).
   - When to consider chemical options (and safety notes).
   - Cultural fixes (adjust watering, improve drainage, move to better light, repot, etc.).
   - Prevention tips for the future.

6. Additional Advice
   - Ideal growing conditions recap (light, water, soil, temperature, humidity for this plant).
   - When to seek more help (e.g., "If no improvement in 7–10 days, consult local extension service").
   - Safe to eat? (for edibles/vegetables/fruits).

Be encouraging, accurate, and conservative — never guess wildly. If the image is unclear, poor quality, or not a plant/part relevant to disease (e.g., flower only when issue is on leaves), politely ask for a clearer/better photo of the affected area (leaves, stems, roots if possible). If no issue is visible, celebrate it and give general care tips.`;

export interface PlantAnalysis {
  plantName: string;
  healthStatus: string;
  confidence: string;
  diagnosis: string;
  severity: string;
  recommendedActions: string;
  preventionCare: string;
  notes: string;
}

export async function analyzePlant(imageB64: string, mimeType: string, additionalText?: string): Promise<PlantAnalysis> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const model = "gemini-3-flash-preview";

  const parts = [
    {
      inlineData: {
        data: imageB64,
        mimeType: mimeType,
      },
    },
    {
      text: additionalText || "Please analyze this plant and provide a diagnosis following the strict PlantGuardian protocol.",
    },
  ];

  const response: GenerateContentResponse = await ai.models.generateContent({
    model,
    contents: [{ parts }],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.4,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          plantName: { type: Type.STRING, description: "Identified plant name" },
          healthStatus: { type: Type.STRING, description: "Overall health status" },
          confidence: { type: Type.STRING, description: "Confidence level (High/Medium/Low)" },
          diagnosis: { type: Type.STRING, description: "Detailed diagnosis and symptoms (Markdown supported)" },
          severity: { type: Type.STRING, description: "Severity rating" },
          recommendedActions: { type: Type.STRING, description: "Step-by-step treatment plan (Markdown supported)" },
          preventionCare: { type: Type.STRING, description: "Ideal care and prevention tips (Markdown supported)" },
          notes: { type: Type.STRING, description: "Extra warnings or notes (Markdown supported)" },
        },
        required: ["plantName", "healthStatus", "confidence", "diagnosis", "severity", "recommendedActions", "preventionCare", "notes"]
      }
    },
  });

  return JSON.parse(response.text);
}
