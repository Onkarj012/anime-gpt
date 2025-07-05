# AnimeGPT

AnimeGPT is an AI-powered chatbot for anime superfans! It uses Pinecone for vector search, Groq for chat completions, and Next.js for the frontend. Ask anything about anime, series, movies, manga, creators, studios, and more.

## Features
- **Semantic search** over recent anime news using Pinecone vector database
- **Streaming chat completions** powered by Groq LLMs
- **Modern Next.js frontend** with markdown support

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/anime-gpt.git
cd anime-gpt
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the project root with the following:
```
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX=animegpt
PINECONE_CLOUD=aws
PINECONE_REGION=us-east-1
GROQ_API_KEY=your-groq-api-key
```

### 4. Seed the Pinecone database
This will scrape anime news, embed it, and upsert to Pinecone:
```bash
npm run seed
```

### 5. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to use AnimeGPT.

## Project Structure
- `app/api/chat/route.ts` — API route for chat, Pinecone search, and Groq completions
- `scripts/loadDB.ts` — Script to scrape, embed, and upsert anime news to Pinecone
- `app/page.tsx` — Main frontend page

## Deployment
AnimeGPT can be deployed on Vercel or any platform supporting Next.js.

## Contributing
Pull requests and issues are welcome!

---

**First commit and push completed.**

---

AnimeGPT © 2024
