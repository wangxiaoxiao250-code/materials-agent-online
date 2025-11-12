import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getEmbedding(text) {
  // Uses OpenAI embeddings API
  const resp = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: text
  });
  return resp.data[0].embedding;
}

export function cosineSim(a, b) {
  if (!a || !b) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  na = Math.sqrt(na);
  nb = Math.sqrt(nb);
  if (na === 0 || nb === 0) return 0;
  return dot / (na * nb);
}
