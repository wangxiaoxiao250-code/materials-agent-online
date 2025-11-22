// pages/api/chat.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages } = req.body || {};
    const lastUser = Array.isArray(messages)
      ? messages[messages.length - 1]?.content
      : '';

    // 👉 先不调 iFlow，直接返回一段固定文本，测试前后端连通性
    return res.status(200).json({
      reply: `后端联通测试成功！你刚才说的是：${lastUser || '（空）'}`,
    });
  } catch (e) {
    // 即使这里出错，也强行返回 200，避免 axios 抛错
    return res
      .status(200)
      .json({ reply: '后端代码异常，但接口已被访问到。' });
  }
}
