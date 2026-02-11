
export enum ToolType {
  CHAT = 'CHAT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  VOICE = 'VOICE',
  PROFIT = 'PROFIT'
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  image?: string;
}

export interface GenerationState {
  isGenerating: boolean;
  progress?: number;
  error?: string;
  result?: string;
}
