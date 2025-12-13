import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Question, QuestionType, Difficulty } from "../types";

// NOTE: Ideally, this would connect to your Python + SQLite backend.
// Since we are in a frontend-only environment, we use Gemini 2.5 Flash
// to perform the OCR and question extraction dynamically.

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ocrResponseSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      originalText: { type: Type.STRING, description: "The clean, printed text of the question stem. EXCLUDE any handwritten student answers, circles, ticks, or grading marks. Use LaTeX for math ($x^2$)." },
      type: { type: Type.STRING, enum: Object.values(QuestionType), description: "The type of question." },
      options: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING }, 
        description: "If multiple choice, list the printed options. EXCLUDE handwritten checks or circles indicating the student's choice." 
      },
      answer: { type: Type.STRING, description: "The correct answer. If the image contains a key or the correct answer is obvious, include it. If the student wrote an answer, you may extract it here, but keep it separate from originalText." },
      subject: { type: Type.STRING, description: "The academic subject (Math, Physics, History, etc.)." },
      difficulty: { type: Type.STRING, enum: Object.values(Difficulty), description: "Estimated difficulty level." }
    },
    required: ["originalText", "type", "subject"]
  }
};

export const extractQuestionsFromImage = async (base64Image: string): Promise<Question[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/png",
              data: base64Image
            }
          },
          {
            text: "Analyze this exam image. Extract all distinct questions into a clean database format.\n\nCRITICAL INSTRUCTIONS:\n1. IGNORE HANDWRITING: The image may contain student answers, circles around options, or grading marks (ticks/crosses). Do NOT include these in the 'originalText' or 'options'. Extract only the printed question text.\n2. FORMATTING: Use LaTeX for all math expressions (e.g. $E=mc^2$).\n3. ANSWERS: If a solution is visible or can be determined, put it in the 'answer' field. Do not mix answers into the question stem."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: ocrResponseSchema,
        temperature: 0.1 // Low temperature for factual extraction
      }
    });

    const rawData = JSON.parse(response.text || "[]");
    
    // Map to our internal type and add IDs
    return rawData.map((q: any) => ({
      ...q,
      id: crypto.randomUUID(),
      selected: false,
      // Fallbacks
      type: q.type || QuestionType.UNKNOWN,
      difficulty: q.difficulty || Difficulty.MEDIUM
    }));

  } catch (error) {
    console.error("OCR Extraction Failed:", error);
    throw new Error("Failed to recognize questions in the image.");
  }
};

export const getAIResponse = async (history: { role: string, content: string }[], message: string, contextQuestions: Question[]) => {
  try {
    const contextString = contextQuestions.length > 0 
      ? `\nCurrent Study Context (Questions in Bank):\n${JSON.stringify(contextQuestions.map(q => q.originalText))}\n`
      : "";

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: `You are SmartStudy AI, a helpful and encouraging academic tutor. Help the user understand concepts. Use LaTeX for all mathematical expressions (e.g. $x^2$). ${contextString}`,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.content }]
      }))
    });

    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Chat Failed:", error);
    return "Sorry, I'm having trouble connecting to the knowledge base right now.";
  }
};