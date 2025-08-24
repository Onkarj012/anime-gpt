import { useState, useEffect } from 'react';
import { Message, ChatSession } from '../types';

export const useChatHistory = (initialSessionId?: string) => {
  const [sessionId, setSessionId] = useState<string>(
    initialSessionId || `session_${Date.now()}`
  );
  const [sessions, setSessions] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Load sessions list
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const response = await fetch('/api/chat-history');
        const data = await response.json();
        setSessions(data.sessions);
        setLoading(false);
      } catch (error) {
        console.error('Error loading sessions:', error);
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  // Load specific session
  useEffect(() => {
    const loadSession = async () => {
      if (!sessionId) return;

      try {
        const response = await fetch(`/api/chat-history?sessionId=${sessionId}`);
        if (response.ok) {
          const session: ChatSession = await response.json();
          setMessages(session.messages);
        }
      } catch (error) {
        console.error('Error loading session:', error);
      }
    };

    loadSession();
  }, [sessionId]);

  // Save messages when they change
  useEffect(() => {
    const saveMessages = async () => {
      if (!sessionId || !messages.length) return;

      try {
        await fetch('/api/chat-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, messages }),
        });
      } catch (error) {
        console.error('Error saving messages:', error);
      }
    };

    saveMessages();
  }, [sessionId, messages]);

  const createNewSession = () => {
    const newSessionId = `session_${Date.now()}`;
    setSessionId(newSessionId);
    setMessages([]);
  };

  const switchSession = (newSessionId: string) => {
    setSessionId(newSessionId);
  };

  const deleteSession = async (sessionIdToDelete: string) => {
    try {
      const response = await fetch(`/api/chat-history?sessionId=${sessionIdToDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSessions(prev => prev.filter(id => id !== sessionIdToDelete));
        if (sessionId === sessionIdToDelete) {
          createNewSession();
        }
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  return {
    sessionId,
    sessions,
    messages,
    setMessages,
    createNewSession,
    switchSession,
    deleteSession,
    loading,
  };
};
