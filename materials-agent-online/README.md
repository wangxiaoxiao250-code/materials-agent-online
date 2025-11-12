# Materials Agent (Online) — "材料与化工智能助理"

This is a Next.js demo project that implements:
- a chat UI,
- a role-defined assistant ("材料与化工智能助理"),
- a local knowledge-base (`/knowledge/kb.json`),
- semantic retrieval using OpenAI Embeddings (requires `OPENAI_API_KEY`),
- integration with OpenAI Chat for final responses.

## How to deploy (Vercel)

1. Upload this repository to GitHub or use Vercel CLI.
2. In Vercel project settings add an environment variable:
   - `OPENAI_API_KEY` = your OpenAI API key
3. Deploy on Vercel (or run locally with `npm install` then `npm run dev`).

## Notes

- This project **requires** an OpenAI API key for embedding and chat.
- Do not commit your API key to public repos.

### Files included
- `pages/` - Next.js pages including API route `pages/api/chat.js`
- `components/Chat.jsx` - Frontend chat UI
- `utils/embedder.js` - Embedding + cosine similarity helpers
- `knowledge/kb.json` - example knowledge base

欢迎使用 “材料与化工智能助理” 演示项目。