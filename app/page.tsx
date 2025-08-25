"use client";
import { useState, useCallback, memo, useMemo } from "react";
import { useChatHistory } from "./hooks/useChatHistory";

import { Message } from "./types";

// Enhanced markdown parser with better formatting
const parseMarkdown = (text: string): string => {
  return (
    text
      // Alternative Headers (=== and ---)
      .replace(/^(.+)\n=+$/gm, '<h1 class="md-h1">$1</h1>')
      .replace(/^(.+)\n-+$/gm, '<h2 class="md-h2">$1</h2>')
      // Standard Headers
      .replace(/^### (.*$)/gm, '<h3 class="md-h3">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="md-h2">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="md-h1">$1</h1>')
      // Bold and Italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="md-bold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="md-italic">$1</em>')
      // Lists
      .replace(/(?:(?:\r?\n|\r|\n)?[\*\-]\s+([^\n\r]+))+/gm, function (match) {
        const items = match.split(/\r?\n|\r|\n/).filter((line) => line.trim());
        const listItems = items
          .map(
            (item) =>
              `<li class="md-list-item">${item.replace(/^[\*\-]\s+/, "")}</li>`
          )
          .join("");
        return `<ul class="md-list">${listItems}</ul>`;
      })
      // Code blocks
      .replace(
        /```(\w*)\n([\s\S]*?)```/gm,
        '<pre class="md-code-block"><code class="language-$1">$2</code></pre>'
      )
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>')
      // Blockquotes
      .replace(
        /^\> (.*$)/gm,
        '<blockquote class="md-blockquote">$1</blockquote>'
      )
      // Links
      .replace(
        /\[(.*?)\]\((.*?)\)/g,
        '<a class="md-link" href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
      )
      // Paragraphs
      .replace(/\n\n/g, '</p><p class="md-paragraph">')
      // Line breaks
      .replace(/\n/g, "<br>")
      // Wrap in paragraph if not already wrapped
      .replace(/^(.+)$/, '<p class="md-paragraph">$1</p>')
  );
};

const ChatMessage = memo(({ message }: { message: Message }) => {
  ChatMessage.displayName = "ChatMessage";
  const html = useMemo(() => {
    return message.role === "assistant"
      ? parseMarkdown(message.content)
      : message.content;
  }, [message.content, message.role]);

  return (
    <div className={`message ${message.role}`}>
      <div className="message-bubble">
        <div
          className="message-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
});

const SessionSelector = ({
  sessions,
  currentSessionId,
  onSelect,
  onDelete,
  onNew,
}: {
  sessions: string[];
  currentSessionId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}) => {
  return (
    <div className="session-selector">
      <button onClick={onNew} className="new-chat-button">
        New Chat
      </button>
      <div className="session-list">
        {sessions.map((sessionId) => (
          <div
            key={sessionId}
            className={`session-item ${
              sessionId === currentSessionId ? "active" : ""
            }`}
          >
            <button
              onClick={() => onSelect(sessionId)}
              className="session-button"
            >
              Chat{" "}
              {new Date(parseInt(sessionId.split("_")[1])).toLocaleDateString()}
            </button>
            <button
              onClick={() => onDelete(sessionId)}
              className="delete-session-button"
              title="Delete chat"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const Home = () => {
  const {
    sessionId,
    sessions,
    messages,
    setMessages,
    createNewSession,
    switchSession,
    deleteSession,
    loading,
    error,
    clearError,
  } = useChatHistory();

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;

      const userMessage = { role: "user" as const, content: input };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            messages: [...messages, userMessage],
          }),
        });

        if (!response.ok || !response.body)
          throw new Error(response.statusText);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let content = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          const chunks = text.split("\n");

          for (const chunk of chunks) {
            if (chunk.startsWith("data: ")) {
              const data = chunk.slice(6);
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                const newContent = parsed.choices[0]?.delta?.content || "";
                content += newContent;

                setMessages((prev) => {
                  const prevMessages = [...prev];
                  const lastMessage = prevMessages[prevMessages.length - 1];

                  if (lastMessage?.role === "assistant") {
                    // Update existing assistant message
                    prevMessages[prevMessages.length - 1] = {
                      ...lastMessage,
                      content: content, // Use accumulated content instead of concatenating
                    };
                    return prevMessages;
                  }

                  // Add new assistant message
                  return [...prevMessages, { role: "assistant", content }];
                });
              } catch (e) {
                console.error("Error parsing chunk:", e);
              }
            }
          }
        }
      } catch (error) {
        console.error("Chat error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages, setMessages, sessionId]
  );

  const [isDark, setIsDark] = useState(false);
  const noMessage = !messages || messages.length === 0;

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // Enhanced markdown parser with better formatting

  return (
    <div className="app" data-theme={isDark ? "dark" : "light"}>
      {/* Header */}
      <div className="header">
        <h1 className="logo">AnimeGPT</h1>
        <button className="theme-toggle" onClick={toggleTheme}>
          <span className="theme-icon">{isDark ? "☀️" : "🌙"}</span>
          <span className="theme-text">{isDark ? "Light" : "Dark"}</span>
        </button>
      </div>
      {error && (
        <div className="error-toast" onClick={clearError}>
          {error}
          <button className="close-error" onClick={clearError}>
            ×
          </button>
        </div>
      )}
      <div className="app-container">
        {/* Session Selector */}
        {loading ? (
          <div className="session-selector loading">
            <div className="loading-text">Loading sessions...</div>
          </div>
        ) : (
          <SessionSelector
            sessions={sessions}
            currentSessionId={sessionId}
            onSelect={switchSession}
            onDelete={deleteSession}
            onNew={createNewSession}
          />
        )}

        {/* Chat Container */}
        <div className="chat-container">
          <div className="chat-messages">
            {noMessage ? (
              <div className="welcome-message">
                <h2 className="welcome-title">
                  こんにちは！Welcome to AnimeGPT
                </h2>
                <p className="welcome-subtitle">
                  Your personal anime assistant is here to help with
                  recommendations, trivia, and discussions about your favorite
                  series!
                </p>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <ChatMessage key={`message-${index}`} message={message} />
                ))}
                {isLoading && (
                  <div className="message ai">
                    <div className="message-bubble">
                      <div className="loading-dots">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="input-area">
            <form className="input-container" onSubmit={handleSubmit}>
              <textarea
                className="message-input"
                value={input}
                onChange={handleInputChange}
                placeholder="Ask me anything about anime..."
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <button
                type="submit"
                className="send-button"
                disabled={isLoading || !input.trim()}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
      );
    </div>
  );
};

export default Home;
