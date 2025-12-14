export enum QuestionType {
  CHOICE = 'Multiple Choice',
  FILL = 'Fill in the Blank',
  TEXT = 'Short Answer',
  UNKNOWN = 'Unknown'
}

export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard'
}

export interface Question {
  id: string;
  originalText: string;
  type: QuestionType;
  options?: string[];
  answer?: string;
  subject: string;
  source?: string; // New field for question source
  difficulty: Difficulty;
  selected: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  attachment?: string; // Base64 string of the image
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  UPLOAD = 'UPLOAD',
  BANK = 'BANK',
  PRINT = 'PRINT',
  TUTOR = 'TUTOR',
  KNOWLEDGE = 'KNOWLEDGE',
  SETTINGS = 'SETTINGS'
}

export type ThemeColor = 'neutral' | 'indigo' | 'rose' | 'blue' | 'emerald' | 'violet';
export type Language = 'en' | 'zh';

export interface UploadedFile {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'queued' | 'processing' | 'completed' | 'error';
  error?: string;
}