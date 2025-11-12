import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { getEmbedding, cosineSim } from "../../utils/embedder.js";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Role definition
const system_prompt = `你是一名材料与化工专业的科研助理（材料与化工智能助理），特别擅长 MOF 合成与发光材料研究。
// 回答时请遵循：
1) 先给出 1-2 句简洁结论；
2) 给出关键实验参数（溶剂、温度、时间、浓度）或可行步骤；
3) 最后补充注意事项与安全提示；
4) 如果知识库中有匹配内容，请在回答中引用知识库条目ID（例如：知识库mof1）。
语言：中文。`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages 必需为非空数组" });
    }

    const kbPath = path.join(process.cwd(), "knowledge", "kb.json");
    const kb = JSON.parse(fs.readFileSync(kbPath, "utf8"));

    const question = messages[messages.length - 1].content;
    // compute question embedding
    const qVec = await getEmbedding(question);

    // compute similarity with KB entries (cache embeddings could be added for speed)
    let scored = [];
    for (const item of kb) {
      const itemVec = await getEmbedding(item.content);
      const score = cosineSim(qVec, itemVec);
      scored.push({ ...item, score });
    }
    scored.sort((a,b) => b.score - a.score);
    const best = scored[0];
    const relatedInfo = best && best.score >= 0.75 ? `知识库条目(${best.id}): ${best.title}\n${best.content}` : "";

    // Prepare messages for OpenAI Chat (system + history + KB context)
    const chatMessages = [
      { role: "system", content: system_prompt },
      ...messages,
    ];
    if (relatedInfo) {
      chatMessages.push({ role: "system", content: `相关知识库内容：\n${relatedInfo}` });
    } else {
      chatMessages.push({ role: "system", content: "相关知识库内容：未找到高置信度匹配。" });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatMessages,
      max_tokens: 700
    });

    const reply = completion.choices?.[0]?.message?.content || "抱歉，模型未返回内容。";
    res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "服务器错误", details: String(err) });
  }
}
