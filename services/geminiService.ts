import { GoogleGenAI, Type } from "@google/genai";
import { MoleculeInsights } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getMoleculeInsights = async (structureString: string): Promise<MoleculeInsights> => {
  if (!apiKey) {
    console.warn("No API Key provided for Gemini");
    return {};
  }

  try {
    const model = ai.models.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: "You are a chemistry expert. Provide a JSON summary for the given chemical structure string (SMILES or InChI).",
    });

    const response = await model.generateContent({
      contents: `Analyze this structure: ${structureString}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            commonName: { type: Type.STRING },
            iupacName: { type: Type.STRING },
            formula: { type: Type.STRING },
            molecularWeight: { type: Type.STRING },
            description: { type: Type.STRING, description: "A very brief, one-sentence description of the molecule's primary use or class." },
          },
        },
      },
    });

    if (response.text) {
        return JSON.parse(response.text) as MoleculeInsights;
    }
    return {};

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {};
  }
};