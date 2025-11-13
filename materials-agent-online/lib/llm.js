// lib/llm.js
// 通用的 OpenAI 兼容 Chat Completions 调用（默认对接 iFlow）
// 依赖环境变量：
//   API_BASE_URL = https://apis.iflow.cn/v1
//   API_KEY      = <你的 iFlow API Key>
//   MODEL        = <你的模型名>
//
// 说明：这里使用 Next.js 内置的 fetch（Node 18+），无需额外引包。

export async function chatCompletions({ messages, model, stream = false, temperature = 0.7 }) {
  const baseUrl = process.env.API_BASE_URL;
  const apiKey  = process.env.API_KEY;
  const mdl     = model || process.env.MODEL;

  if (!baseUrl || !apiKey) {
    throw new Error("API_BASE_URL 或 API_KEY 未配置（请在 Vercel 环境变量里设置）");
  }
  if (!mdl) {
    throw new Error("模型名未配置（请设置环境变量 MODEL 或在调用时传入 model）");
  }

  const url = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: mdl,
      messages,
      temperature,
      stream
    })
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`Chat API ${resp.status}: ${text}`);
  }

  // 非流式，便于课程作业截图与验收
  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("上源返回无内容（choices[0].message.content 为空）");
  }
  return content;
}
