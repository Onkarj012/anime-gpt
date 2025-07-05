import { Pinecone } from '@pinecone-database/pinecone';
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { pipeline } from "@xenova/transformers";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import "dotenv/config";

const {
  PINECONE_API_KEY,
  PINECONE_INDEX,
  PINECONE_CLOUD,
  PINECONE_REGION,
} = process.env;

const animeNewsSources = [
  "https://www.animenewsnetwork.com/",
  "https://www.crunchyroll.com/news",
  "https://myanimelist.net/news",
  "https://anitrendz.net/news/",
  "https://www.livechart.me/",
  "https://anichart.net/",
  "https://honeysanime.com/",
  "https://otakuusamagazine.com/",
  "https://www.cbr.com/anime/",
  "https://screenrant.com/anime/"
];

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 64,
});

const pc = new Pinecone({
  apiKey: PINECONE_API_KEY!,
});
const index = pc.index(PINECONE_INDEX!);

const createIndexIfNotExists = async () => {
  const existing = await pc.listIndexes();
  const exists = existing.indexes.some(idx => idx.name === PINECONE_INDEX!);
  if (!exists) {
    await pc.createIndex({
      name: PINECONE_INDEX!,
      dimension: 384,
      metric: "cosine",
      spec: {
        serverless: {
          cloud: (PINECONE_CLOUD as "aws" | "gcp" | "azure") || "aws",
          region: PINECONE_REGION || "us-east-1",
        },
      },
    });
    console.log("Pinecone index created");
  } else {
    console.log("Pinecone index exists");
  }
};

const loadSampleData = async () => {
  const embedder = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2"
  );

  for await (const url of animeNewsSources) {
    const content = await scrapePage(url);
    const chunks = await splitter.splitText(content);
    for await (const chunk of chunks) {
      const output = await embedder(chunk, { pooling: "mean", normalize: true });
      const vector = Array.from(output.data);
      const id = Math.random().toString(36).substring(2);
      try {
        await index.upsert([
          {
            id,
            values: vector,
            metadata: { text: chunk },
          },
        ]);
        console.log(`Upserted chunk: ${id}`);
      } catch (err) {
        console.error("Error upserting chunk", err);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }
};

const scrapePage = async (url: string) => {
  const loader = new CheerioWebBaseLoader(url);
  const docs = await loader.load();
  return docs.map(doc => doc.pageContent).join("\n");
};

(async () => {
  await createIndexIfNotExists();
  await loadSampleData();
})();
