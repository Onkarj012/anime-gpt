import fs from 'fs';
import path from 'path';
import { Message } from '../types';

const CHAT_HISTORY_DIR = path.join(process.cwd(), 'data', 'chat-history');

// Ensure chat history directory exists
if (!fs.existsSync(CHAT_HISTORY_DIR)) {
  fs.mkdirSync(CHAT_HISTORY_DIR, { recursive: true });
}

interface ChatSession {
  id: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export const getChatHistory = (sessionId: string): ChatSession | null => {
  try {
    const filePath = path.join(CHAT_HISTORY_DIR, `${sessionId}.json`);
    if (!fs.existsSync(filePath)) return null;
    
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent) as ChatSession;
  } catch (error) {
    console.error('Error reading chat history:', error);
    return null;
  }
};

export const saveChatHistory = (sessionId: string, messages: Message[]): void => {
  try {
    const filePath = path.join(CHAT_HISTORY_DIR, `${sessionId}.json`);
    const existingSession = getChatHistory(sessionId);
    
    const session: ChatSession = {
      id: sessionId,
      createdAt: existingSession?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages,
    };
    
    fs.writeFileSync(filePath, JSON.stringify(session, null, 2));
  } catch (error) {
    console.error('Error saving chat history:', error);
  }
};

export const listChatSessions = (): string[] => {
  try {
    return fs.readdirSync(CHAT_HISTORY_DIR)
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
  } catch (error) {
    console.error('Error listing chat sessions:', error);
    return [];
  }
};

export const deleteChatHistory = (sessionId: string): boolean => {
  try {
    const filePath = path.join(CHAT_HISTORY_DIR, `${sessionId}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting chat history:', error);
    return false;
  }
};
