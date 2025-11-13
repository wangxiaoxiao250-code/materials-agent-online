import { chatCompletions } from "../../lib/llm";
import { buildSystemPrompt, pickDynamicRoles } from "../../lib/roles";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { history = [], userInput = "" } = req.body || {};
    const model = process.env.MODEL || "gpt-3.5-turbo"; // 兼容默认

    // 渐进式角色装载（基础 + 场景）
    const roleTags = pickDynamicRoles(userInput, history);
    const systemPrompt = buildSystemPrompt(roleTags);

    const messages = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: userInput }
    ];

    const reply = await chatCompletions({
      messages,
      model,
      stream: false,
      temperature: 0.7
    });

    return res.status(200).json({ content: reply });
  } catch (err) {
    console.error("API /chat error:", err);
    return res.status(500).json({ error: "后端错误：" + (err?.message || "unknown") });
  }
}
