import { pipeline } from "@xenova/transformers";
import { Pinecone } from "@pinecone-database/pinecone";
import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const {
  PINECONE_API_KEY,
  PINECONE_INDEX,
  GROQ_API_KEY,
} = process.env;

// Embedding pipeline singleton
const embedderPromise = pipeline(
  "feature-extraction",
  "Xenova/all-MiniLM-L6-v2"
);

// Pinecone client singleton
const pc = new Pinecone({
  apiKey: PINECONE_API_KEY!,
});

// Pinecone index handle
const index = pc.index(PINECONE_INDEX!);

// Groq client
const groq = new Groq({
  apiKey: GROQ_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    if (!messages?.length) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 }
      );
    }

    const latestMessage = messages[messages.length - 1]?.content;
    if (!latestMessage) {
      return NextResponse.json(
        { error: "Empty message content" },
        { status: 400 }
      );
    }

    // Embed user input
    const embedder = await embedderPromise;
    const output = await embedder(latestMessage, {
      pooling: "mean",
      normalize: true,
    });
    const vector = Array.from(output.data);

    // Query Pinecone
    let docContext = "";
    try {
      const queryRes = await index.query({
        vector,
        topK: 10,
        includeMetadata: true,
      });

      const docs = queryRes.matches?.map(
        (m) => m.metadata?.text || ""
      ) ?? [];
      docContext = docs.join("\n\n");
    } catch (err) {
      console.error("Error querying Pinecone:", err);
    }

    // System prompt
    const systemPrompt = {
      role: "system",
      content: `
You are an AI assistant who knows everything about anime.
Use the below context to augment what you know about anime, including series, movies, manga, creators, studios, and fandom topics.
If the context doesn't include the information you need, answer based on your existing knowledge.
Format responses using markdown where applicable and don't return images.

--------------------
START CONTEXT
${docContext}
END CONTEXT
--------------------
QUESTION: ${latestMessage}
      `.trim(),
    };

    // Rebuild Groq messages array
    const groqMessages = [systemPrompt, ...messages].map((msg) => ({
      role: msg.role,
      content: msg.content,
      ...(msg.name ? { name: msg.name } : {}),
    }));

    // Create Groq streaming response
    const groqResponse = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: groqMessages,
      stream: true,
    });

    // Convert Groq stream into AI SDK compatible format
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of groqResponse) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              const payload = {
                choices: [{ delta: { content } }]
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error("Stream processing error:", error);
          controller.error(error);
        }
      }
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (err) {
    console.error("Unhandled error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
