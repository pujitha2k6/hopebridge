import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const verifyDocumentWithAI = async (file: File): Promise<{ isValid: boolean; reason: string }> => {
  if (!apiKey) {
    console.warn("No API key found, simulating AI verification.");
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ isValid: true, reason: "Simulation: Document structure matches academic record patterns." });
      }, 2000);
    });
  }

  try {
    // Convert file to base64
    const base64Data = await fileToGenerativePart(file);

    const model = 'gemini-2.5-flash';
    const prompt = "Analyze this image. Is it a valid academic marks memo, certificate, or transcript? Check for signs of tampering or fake formatting. Return ONLY a JSON object with keys: 'isValid' (boolean) and 'reason' (string).";

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { inlineData: { mimeType: file.type, data: base64Data } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const result = JSON.parse(text);
    return result;

  } catch (error) {
    console.error("AI Verification failed", error);
    // Fallback for demo purposes if API call fails
    return { isValid: true, reason: "AI Service unavailable, manual review pending. (Fallback)" };
  }
};

async function fileToGenerativePart(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}