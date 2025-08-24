import { Message } from '../types';
import { saveToS3, getFromS3, listFromS3, deleteFromS3 } from './s3';

export interface ChatSession {
  id: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export const getChatHistory = async (sessionId: string): Promise<ChatSession | null> => {
  try {
    return await getFromS3(sessionId);
  } catch (error) {
    console.error('Error reading chat history:', error);
    return null;
  }
};

export const saveChatHistory = async (sessionId: string, messages: Message[]): Promise<void> => {
  try {
    const existingSession = await getChatHistory(sessionId);
    
    const session: ChatSession = {
      id: sessionId,
      createdAt: existingSession?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages,
    };
    
    await saveToS3(sessionId, session);
  } catch (error) {
    console.error('Error saving chat history:', error);
    throw error;
  }
};

export const listChatSessions = async (): Promise<string[]> => {
  try {
    return await listFromS3();
  } catch (error) {
    console.error('Error listing chat sessions:', error);
    return [];
  }
};

export const deleteChatHistory = async (sessionId: string): Promise<boolean> => {
  try {
    await deleteFromS3(sessionId);
    return true;
  } catch (error) {
    console.error('Error deleting chat history:', error);
    return false;
  }
};
