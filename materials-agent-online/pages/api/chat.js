const API_BASE = process.env.IFLOW_API_BASE_URL || 'https://api.siliconflow.cn/v1';
const API_KEY = process.env.IFLOW_API_KEY;
const MODEL = process.env.IFLOW_MODEL || 'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B';

const system_prompt = `你是一名材料与化工专业的科研助理（材料与化工智能助理），特别善于 MOF 合成与发光材料研究。
1) 先给出 1-2 句简洁结论；
2) 给出关键实验参数（溶剂、温度、时间、浓度）或可行步骤；
3) 最后补充注意事项与安全提示；
4) 如果知识库中有匹配内容，请在回答中引用知识库条目ID（例如：知识库mof1）。
语言：中文。`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!API_KEY) {
    return res.status(200).json({
      reply: '后端配置错误：未找到 IFLOW_API_KEY，请在 Vercel 环境变量中添加。'
    });
  }

  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(200).json({ reply: '请求格式错误：messages 必须为非空数组。' });
    }

    const messagesForAI = [
      { role: 'system', content: system_prompt },
      ...messages,
    ];

    const response = await fetch(`${API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messagesForAI,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('iFlow API error:', response.status, text);
      return res.status(200).json({
        reply: `调用 iFlow API 失败，状态码 ${response.status}。\n原始返回：\n${text}`,
      });
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      console.error('iFlow 返回数据异常：', data);
      return res.status(200).json({ reply: 'iFlow 返回数据格式异常，没有找到回复内容。' });
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('调用 iFlow 失败：', error);
    return res.status(200).json({ reply: `后端运行异常：${String(error)}` });
  }
}
