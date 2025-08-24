import { NextRequest, NextResponse } from 'next/server';
import {
  getChatHistory,
  saveChatHistory,
  listChatSessions,
  deleteChatHistory,
} from '@/app/utils/chatHistory';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('sessionId');

  if (sessionId) {
    // Get specific chat session
    const session = getChatHistory(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    return NextResponse.json(session);
  } else {
    // List all sessions
    const sessions = listChatSessions();
    return NextResponse.json({ sessions });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, messages } = await request.json();

    if (!sessionId || !messages) {
      return NextResponse.json(
        { error: 'Session ID and messages are required' },
        { status: 400 }
      );
    }

    saveChatHistory(sessionId, messages);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving chat history:', error);
    return NextResponse.json(
      { error: 'Failed to save chat history' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID is required' },
      { status: 400 }
    );
  }

  const success = deleteChatHistory(sessionId);
  if (!success) {
    return NextResponse.json(
      { error: 'Failed to delete chat history' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
