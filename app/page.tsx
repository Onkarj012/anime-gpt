"use client";
import Image from "next/image";
import LOGO from "./assets/LOGO.png";
import { useChat } from "@ai-sdk/react";
import { Message } from "ai";
import Bubble from "./components/Bubble";
import LoadingBubble from "./components/LoadingBubble";
import PromptSuggestionRow from "./components/PromptSuggestionRow";

const Home = () => {
  const {
    append,
    isLoading,
    messages,
    input,
    handleInputChange,
    handleSubmit,
  } = useChat();

  const noMessage = !messages || messages.length === 0;

  const handlePrompt = (promptText) => {
    const msg: Message = {
      id: crypto.randomUUID(),
      content: promptText,
      role: "user",
    };
    append(msg);
  };

  return (
    <main>
      <Image src={LOGO} width="250" alt="AnimeGPT Logo"></Image>
      <section className={noMessage ? "" : "populated"}>
        {noMessage ? (
          <>
            <p className="starter-text">
              The Ultimate place for Anime super fans! Ask AnimeGPT anything
              about Anime and the latest in Anime!
              <br />
              <PromptSuggestionRow onPromptClick={handlePrompt} />
            </p>
          </>
        ) : (
          <>
            {/* map messages onto text bubble */}
            {messages.map((messages, index) => (
              <Bubble key={`message-${index}`} message={messages} />
            ))}
            {isLoading && <LoadingBubble />}
          </>
        )}
      </section>
      <form onSubmit={handleSubmit}>
        <input
          className="question-box"
          onChange={handleInputChange}
          value={input}
          placeholder="Ask me anthing.."
        ></input>
        <input type="submit" />
      </form>
    </main>
  );
};

export default Home;
