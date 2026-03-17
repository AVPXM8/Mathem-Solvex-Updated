const path = require("path");
const mongoose = require("mongoose");
const { GoogleGenAI } = require("@google/genai");
const { Pinecone } = require("@pinecone-database/pinecone");
const Question = require("../models/Question");
const axios = require("axios");

// 🔹 Load environment variables safely
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

// 🔹 Validate required environment variables
const requiredEnvVars = [
  "PINECONE_API_KEY",
  "GEMINI_API_KEY",
  "PINECONE_INDEX",
  "MONGODB_URI",
];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

console.log("✅ Environment variables validated");

// 🔹 Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pinecone.index(process.env.PINECONE_INDEX);

const BATCH_SIZE = 10;
const DELAY_MS = 500; // 500ms between requests to avoid rate limits

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─────────────────────────────────────────────────────────
// Direct REST call for embeddings — bypasses the @google/genai
// SDK's broken embedContent. Uses stable v1beta REST endpoint.
// Returns a vector (number[]).
// ─────────────────────────────────────────────────────────
const embedTextREST = async (text) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${process.env.GEMINI_API_KEY}`;
  const response = await axios.post(url, {
    content: { parts: [{ text }] },
  });
  return response.data.embedding.values;
};

const embedAndUpsert = async () => {
  try {
    // Connect MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Quick test: verify embedding works before processing 3000+ questions
    console.log("🔬 Testing embedding API...");
    await embedTextREST("test");
    console.log("✅ Embedding API working (REST v1beta / embedding-001)");

    const questions = await Question.find({});
    console.log(`📊 Found ${questions.length} questions\n`);

    let successCount = 0;
    let skipCount = 0;

    for (let i = 0; i < questions.length; i += BATCH_SIZE) {
      const batch = questions.slice(i, i + BATCH_SIZE);
      const vectors = [];

      console.log(
        `🔄 Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(questions.length / BATCH_SIZE)} — questions ${i + 1}–${i + batch.length}`
      );

      for (const q of batch) {
        try {
          const textToEmbed = `Exam: ${q.exam || "Unknown"}. Subject: ${
            q.subject || "General"
          }. Question: ${q.questionText || ""}`;

          const embedding = await embedTextREST(textToEmbed);

          vectors.push({
            id: q._id.toString(),
            values: embedding,
            metadata: {
              exam: q.exam || "",
              subject: q.subject || "",
              year: q.year ? q.year.toString() : "",
              textSummary: q.questionText
                ? q.questionText.substring(0, 500)
                : "",
            },
          });

          successCount++;
          await sleep(DELAY_MS);
        } catch (err) {
          skipCount++;
          console.warn(`  ⚠️ Skipped ${q._id}: ${err?.response?.data?.error?.message || err.message}`);
        }
      }

      // Upsert batch to Pinecone
      if (vectors.length > 0) {
        await index.upsert(vectors);
        console.log(`  ✅ Upserted ${vectors.length} (total: ${successCount} done, ${skipCount} skipped)`);
      }
    }

    console.log(`\n🎉 Seeding complete! Embedded: ${successCount} | Skipped: ${skipCount}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Fatal Error:", error?.response?.data?.error?.message || error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

embedAndUpsert();
