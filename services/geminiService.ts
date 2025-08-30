import { GoogleGenAI, Type } from "@google/genai";
import type { CanvasObject } from '../types';

function getCanvasContext(objects: CanvasObject[]): string {
    if (objects.length === 0) {
        return "The canvas is empty.";
    }
    const context = objects.map((obj, index) => {
        let description = `Object ${index + 1} (${obj.type}):\n`;
        switch (obj.type) {
            case 'sticky':
                description += `A sticky note with color ${obj.data.color} says: "${obj.data.text}"`;
                break;
            case 'text':
                description += `A text box says: "${obj.data.text}"`;
                break;
            case 'shape':
                description += `A ${obj.data.shape} shape.`;
                break;
        }
        return description;
    }).join('\n\n');
    return `Here is the content of the canvas:\n\n${context}`;
}

// FIX: Initialize the GoogleGenAI client once using the API key from environment variables, as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// FIX: Removed the 'apiKey' parameter to use the globally configured AI client.
export async function generateProjectBrief(objects: CanvasObject[]): Promise<string> {
    const context = getCanvasContext(objects);

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `${context}\n\nBased on the canvas objects above, generate a structured project brief.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    projectName: {
                        type: Type.STRING,
                        description: "A creative and relevant name for the project."
                    },
                    summary: {
                        type: Type.STRING,
                        description: "A one-paragraph summary of the project's goals."
                    },
                    keyFeatures: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "A bulleted list of the main features or components."
                    },
                    nextSteps: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "A list of immediate next steps or action items."
                    }
                }
            }
        }
    });

    return response.text;
}

// FIX: Removed the 'apiKey' parameter to use the globally configured AI client.
export async function summarizeCanvas(objects: CanvasObject[]): Promise<string> {
    const context = getCanvasContext(objects);

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `${context}\n\nSummarize the key points and themes from these notes in a concise paragraph.`
    });
    
    return response.text;
}

// FIX: Removed the 'apiKey' parameter to use the globally configured AI client.
export async function canvasChat(objects: CanvasObject[], message: string): Promise<string> {
    const context = getCanvasContext(objects);

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `${context}\n\nBased on the canvas context above, answer the following question: "${message}"`,
        config: {
            systemInstruction: "You are a helpful project assistant. Your answers should be based on the provided canvas context. If the context is not enough, say so."
        }
    });

    return response.text;
}
