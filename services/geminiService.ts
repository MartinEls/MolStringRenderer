import { GoogleGenAI, Type } from "@google/genai";
import { MoleculeInsights } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

const cleanJson = (text: string): string => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export const getMoleculeInsights = async (structureString: string): Promise<MoleculeInsights> => {
  if (!process.env.API_KEY) {
    console.warn("No API Key provided for Gemini");
    return {};
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Analyze this structure: ${structureString}`,
      config: {
        systemInstruction: "You are a chemistry expert. Provide a JSON summary for the given chemical structure string (SMILES or InChI).",
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
        return JSON.parse(cleanJson(response.text)) as MoleculeInsights;
    }
    return {};

  } catch (error) {
    console.error("Gemini API Error (Insights):", error);
    return {};
  }
};

export const convertInchiToSmiles = async (inchiString: string): Promise<string> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Convert this InChI string to a canonical SMILES string. Return ONLY the SMILES string in the JSON response under the key 'smiles'. Input: ${inchiString}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
             smiles: { type: Type.STRING }
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(cleanJson(response.text));
      return data.smiles || "";
    }
    return "";
  } catch (error) {
    console.error("Gemini API Error (Conversion):", error);
    throw new Error("Failed to convert InChI to SMILES");
  }
}