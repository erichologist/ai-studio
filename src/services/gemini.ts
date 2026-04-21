import { GoogleGenAI, Type } from "@google/genai";
import { GameState, StoryNode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const SYSTEM_INSTRUCTION = `You are the ultimate Dungeon Master and storyteller for "AetherQuest", an infinite choose-your-own-adventure game.
Your goal is to provide immersive, high-stakes narrative based on user choices.

RULES:
1. NEVER lead to pre-set paths. Every choice genuinely alters the world state.
2. Maintain a consistent "Ethereal Dark Fantasy" tone with a focus on mystery and atmosphere.
3. Track the "Inventory" and "Current Quest" dynamically.
4. Provide 3-4 distinct choices for every turn.
5. Generate a vivid visual prompt for an image generator (Consistent Art Style: Cinematic dark fantasy oil painting, deep blues and golds, dramatic rim lighting).

OUTPUT FORMAT:
You MUST respond in valid JSON matching the schema provided.`;

export async function generateInitialScene(): Promise<StoryNode> {
  const prompt = "Start a new adventure. Begin in a mysterious location. Briefly describe the setting, the stakes, and give initial choices.";
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          storyText: { type: Type.STRING },
          choices: { type: Type.ARRAY, items: { type: Type.STRING } },
          imagePrompt: { type: Type.STRING },
          newItems: { type: Type.ARRAY, items: { type: Type.STRING } },
          newQuest: { type: Type.STRING }
        },
        required: ["storyText", "choices", "imagePrompt"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
}

export async function generateNextTurn(
  choice: string, 
  history: { role: string; text: string }[], 
  state: GameState
): Promise<StoryNode> {
  const context = `
    Current Inventory: ${state.inventory.join(", ") || "Empty"}
    Current Quest: ${state.currentQuest}
    Player Choice: "${choice}"
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
      { role: "user", parts: [{ text: context }] }
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          storyText: { type: Type.STRING },
          choices: { type: Type.ARRAY, items: { type: Type.STRING } },
          imagePrompt: { type: Type.STRING },
          newItems: { type: Type.ARRAY, items: { type: Type.STRING } },
          removedItems: { type: Type.ARRAY, items: { type: Type.STRING } },
          newQuest: { type: Type.STRING }
        },
        required: ["storyText", "choices", "imagePrompt"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
}

export async function generateSceneImage(imagePrompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: imagePrompt }],
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  return `https://picsum.photos/seed/${encodeURIComponent(imagePrompt)}/800/600`;
}
