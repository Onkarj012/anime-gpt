"use client";
import { useChat } from "@ai-sdk/react";
import { Message } from "ai";
import { useState } from "react";

const Home = () => {
  const {
    append,
    isLoading,
    messages,
    input,
    handleInputChange,
    handleSubmit,
  } = useChat();

  const [isDark, setIsDark] = useState(false);
  const noMessage = !messages || messages.length === 0;

  const handlePrompt = (promptText: string) => {
    const msg: Message = {
      id: crypto.randomUUID(),
      content: promptText,
      role: "user",
    };
    append(msg);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const parseMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="app" data-theme={isDark ? 'dark' : 'light'}>
      {/* Header */}
      <div className="header">
        <h1 className="logo">AnimeGPT</h1>
        <button className="theme-toggle" onClick={toggleTheme}>
          <span className="theme-icon">{isDark ? '☀️' : '🌙'}</span>
          <span className="theme-text">{isDark ? 'Light' : 'Dark'}</span>
        </button>
      </div>

      {/* Chat Container */}
      <div className="chat-container">
        <div className="chat-messages">
          {noMessage ? (
            <div className="welcome-message">
              <h2 className="welcome-title">こんにちは！Welcome to AnimeGPT</h2>
              <p className="welcome-subtitle">
                Your personal anime assistant is here to help with recommendations, trivia, and discussions about your favorite series!
              </p>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div key={`message-${index}`} className={`message ${message.role}`}>
                  <div className="message-bubble">
                    <div 
                      className="message-content"
                      dangerouslySetInnerHTML={{
                        __html: message.role === 'assistant' 
                          ? parseMarkdown(message.content)
                          : message.content
                      }}
                    />
                  </div>
                </div>
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
                if (e.key === 'Enter' && !e.shiftKey) {
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
};

export default Home;
