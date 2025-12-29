import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ANALYSIS_MODEL = 'gemini-3-flash-preview';
const IMAGE_MODEL = 'gemini-2.5-flash-image';

export const analyzeClothingItem = async (base64Image: string): Promise<{ description: string, suggestions: any }> => {
  const prompt = `
    Analyze this clothing item image.
    1. Provide a brief visual description (color, pattern, type).
    2. Suggest 6 distinct outfit combinations incorporating this item:
       - Casual
       - Business
       - Night Out
       - Athleisure
       - Formal
       - Bohemian
    
    Return ONLY JSON in this format:
    {
      "description": "...",
      "suggestions": {
        "Casual": "...",
        "Business": "...",
        "NightOut": "...",
        "Athleisure": "...",
        "Formal": "...",
        "Bohemian": "..."
      }
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                description: { type: Type.STRING },
                suggestions: {
                    type: Type.OBJECT,
                    properties: {
                        Casual: { type: Type.STRING },
                        Business: { type: Type.STRING },
                        NightOut: { type: Type.STRING },
                        Athleisure: { type: Type.STRING },
                        Formal: { type: Type.STRING },
                        Bohemian: { type: Type.STRING }
                    }
                }
            }
        }
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Analysis failed:", error);
    throw new Error("Failed to analyze clothing item.");
  }
};

export const generateOutfitImage = async (
  base64SourceImage: string,
  styleName: string,
  outfitDescription: string
): Promise<string> => {
  const prompt = `
    Create a professional flat-lay fashion photography image.
    Style: ${styleName}.
    The outfit MUST include the clothing item shown in the input image.
    Complete the outfit with: ${outfitDescription}.
    Layout: Clean, organized flat-lay on a neutral background.
    Lighting: Soft, natural studio lighting.
  `;

  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64SourceImage } },
          { text: prompt }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated.");
  } catch (error) {
    console.error(`Generation failed for ${styleName}:`, error);
    throw error;
  }
};

export const editOutfitImage = async (
  base64Image: string,
  editPrompt: string
): Promise<string> => {
  // Strip prefix if present for API call
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/png", data: cleanBase64 } },
          { text: `Edit this image: ${editPrompt}` }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No edited image returned.");
  } catch (error) {
    console.error("Editing failed:", error);
    throw error;
  }
};