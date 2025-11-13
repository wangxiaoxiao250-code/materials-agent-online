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
    return res.status(405).end();
  }

  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages 必须为非空数组' });
    }

    // 合并 system prompt
    const messagesForAI = [
      { role: 'system', content: system_prompt },
      ...messages
    ];

    // 调用 iFlow API（OpenAI 兼容）
    const response = await fetch(`${API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messagesForAI,
        temperature: 0.7
      })
    });

    // 如果上游报错，完整返回错误信息
    if (!response.ok) {
      const text = await response.text();
      return res.status(500).send(`上游 iFlow API 错误：${text}`);
    }

    const data = await response.json();

    // 提取模型回复
    const reply = data?.choices?.[0]?.message?.content;
    if (!reply) {
      return res.status(500).send("iFlow 返回为空，没有找到 reply");
    }

    // 重点：直接返回字符串（你的前端才能显示）
    return res.status(200).send(reply);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to call iFlow API' });
  }
}

