export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  id?: string;
}

export interface ChatSession {
  id: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}
