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
  difficulty: Difficulty;
  selected: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export enum ViewState {
  UPLOAD = 'UPLOAD',
  BANK = 'BANK',
  PRINT = 'PRINT',
  TUTOR = 'TUTOR',
  KNOWLEDGE = 'KNOWLEDGE',
  SETTINGS = 'SETTINGS'
}

export type ThemeColor = 'indigo' | 'rose' | 'blue' | 'emerald' | 'violet';