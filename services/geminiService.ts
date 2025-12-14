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
      originalText: { type: Type.STRING, description: "The clean, printed text of the question stem. EXCLUDE any handwritten student answers, circles, ticks, or grading marks. Use LaTeX for math ($x^2$). If the question has sub-parts (a, b, c), include them ALL in this single text field." },
      type: { type: Type.STRING, enum: Object.values(QuestionType), description: "The type of question." },
      options: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING }, 
        description: "If multiple choice, list the printed options. EXCLUDE handwritten checks or circles indicating the student's choice." 
      },
      answer: { type: Type.STRING, description: "The correct answer. If the student wrote an answer, extract it here." },
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
            text: "Analyze this exam image. Extract all distinct questions into a clean database format.\n\nCRITICAL INSTRUCTIONS:\n1. GROUP SUB-QUESTIONS: If a question has multiple parts (e.g., 1(a), 1(b), or i, ii, iii), DO NOT split them. Store the main question and all its sub-parts as a SINGLE 'originalText' entry.\n2. IGNORE HANDWRITING: The image may contain student answers, circles around options, or grading marks (ticks/crosses). Do NOT include these in the 'originalText' or 'options'. Extract only the printed question text.\n3. FORMATTING: Use LaTeX for all math expressions (e.g. $E=mc^2$).\n4. ANSWERS: If a solution is visible or can be determined, put it in the 'answer' field. Do not mix answers into the question stem."
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

interface AIResponseOptions {
  useWebSearch: boolean;
  useKnowledgeBase: boolean;
  attachment?: string; // base64 without prefix
}

export const getAIResponse = async (
  history: { role: string, content: string, attachment?: string }[], 
  message: string, 
  contextQuestions: Question[],
  options: AIResponseOptions
) => {
  try {
    const { useWebSearch, useKnowledgeBase, attachment } = options;

    // 1. Construct System Instruction with optional Knowledge Base context
    let systemInstruction = `You are SmartStudy AI, a helpful and encouraging academic tutor. Help the user understand concepts. Use LaTeX for all mathematical expressions (e.g. $x^2$).`;
    
    if (useKnowledgeBase && contextQuestions.length > 0) {
      const contextString = JSON.stringify(contextQuestions.map(q => ({
        question: q.originalText,
        options: q.options,
        answer: q.answer
      })));
      systemInstruction += `\n\nKNOWLEDGE BASE CONTEXT: The user has uploaded the following questions. Refer to them if the user asks about specific problems from their list:\n${contextString}`;
    }

    // 2. Configure Tools (Web Search)
    const tools = [];
    if (useWebSearch) {
      tools.push({ googleSearch: {} });
    }

    // 3. Initialize Chat
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction,
        tools: tools.length > 0 ? tools : undefined,
      },
      history: history.map(h => {
        const parts: any[] = [];
        if (h.attachment) {
           parts.push({
             inlineData: {
               mimeType: "image/png", 
               data: h.attachment
             }
           });
        }
        if (h.content) {
            parts.push({ text: h.content });
        }
        
        return {
          role: h.role,
          parts: parts
        };
      })
    });

    // 4. Construct the current message payload
    const currentMessageParts: any[] = [];
    if (attachment) {
      currentMessageParts.push({
        inlineData: {
          mimeType: "image/png", // Assuming PNG/JPEG for simplicity
          data: attachment
        }
      });
    }
    if (message) {
        currentMessageParts.push({ text: message });
    }

    // 5. Send Message
    const result = await chat.sendMessage({ 
        message: { 
            role: 'user', 
            parts: currentMessageParts 
        } 
    });
    
    return result.text;
  } catch (error) {
    console.error("Chat Failed:", error);
    return "Sorry, I'm having trouble connecting to the service right now. Please try again.";
  }
};

export const getAIResponseStream = async function* (
  history: { role: string, content: string, attachment?: string }[], 
  message: string, 
  contextQuestions: Question[],
  options: AIResponseOptions
) {
  try {
    const { useWebSearch, useKnowledgeBase, attachment } = options;

    let systemInstruction = `You are SmartStudy AI, a helpful and encouraging academic tutor. Help the user understand concepts. Use LaTeX for all mathematical expressions (e.g. $x^2$).`;
    
    if (useKnowledgeBase && contextQuestions.length > 0) {
      const contextString = JSON.stringify(contextQuestions.map(q => ({
        question: q.originalText,
        options: q.options,
        answer: q.answer
      })));
      systemInstruction += `\n\nKNOWLEDGE BASE CONTEXT: The user has uploaded the following questions. Refer to them if the user asks about specific problems from their list:\n${contextString}`;
    }

    const tools = [];
    if (useWebSearch) {
      tools.push({ googleSearch: {} });
    }

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction,
        tools: tools.length > 0 ? tools : undefined,
      },
      history: history.map(h => {
        const parts: any[] = [];
        if (h.attachment) {
           parts.push({
             inlineData: {
               mimeType: "image/png", 
               data: h.attachment
             }
           });
        }
        if (h.content) {
            parts.push({ text: h.content });
        }
        
        return {
          role: h.role,
          parts: parts
        };
      })
    });

    const currentMessageParts: any[] = [];
    if (attachment) {
      currentMessageParts.push({
        inlineData: {
          mimeType: "image/png", 
          data: attachment
        }
      });
    }
    if (message) {
        currentMessageParts.push({ text: message });
    }

    const result = await chat.sendMessageStream({ 
        message: { 
            role: 'user', 
            parts: currentMessageParts 
        } 
    });

    for await (const chunk of result) {
        const text = chunk.text;
        if (text) {
            yield text;
        }
    }

  } catch (error) {
    console.error("Chat Stream Failed:", error);
    yield "Sorry, I'm having trouble connecting to the service right now. Please try again.";
  }
};