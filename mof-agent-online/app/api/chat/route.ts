import { NextRequest, NextResponse } from 'next/server';

const IFLOW_BASE_URL = 'https://apis.iflow.cn/v1';
const DEFAULT_MODEL_NAME = process.env.IFLOW_MODEL_NAME || 'Qwen3-Coder';

function detectRole(userMessage: string): 'literature' | 'experiment' | 'mechanism' | 'writing' {
  const text = userMessage.toLowerCase();
  if (/[文献|综述|review|文章|paper]/.test(text)) return 'literature';
  if (/[合成|配置|配制|表征|xrd|ftir|nmr|pl|tga|烘箱|升温]/i.test(userMessage)) return 'experiment';
  if (/[机理|mechanism|能级|寿命|猝灭|拟合|nonlinear|非线性]/i.test(userMessage)) return 'mechanism';
  if (/[写|润色|翻译|ppt|摘要|introduction|conclusion]/i.test(userMessage)) return 'writing';
  return 'literature';
}

function rolePrefix(role: string): string {
  switch (role) {
    case 'literature':
      return '当前请以【文献分析助手】的角度回答：';
    case 'experiment':
      return '当前请以【实验设计与表征助手】的角度回答，并强调安全注意事项：';
    case 'mechanism':
      return '当前请以【机理与数据分析助手】的角度回答，尽量用图像化的语言解释机理：';
    case 'writing':
      return '当前请以【学术写作助手】的角度回答，注意逻辑清晰、分段合理：';
    default:
      return '';
  }
}

const BASE_SYSTEM_PROMPT = `
你是“材料与化工智能研究助理（MatChem Research Agent）”，服务对象是材料科学与化工专业的本科生和研究生，特别熟悉 MOF 发光材料、Zr 基非晶、高分子材料、材料成型及相关工艺和表征。

思维模式：
- 先判断问题类型（文献/实验/机理/写作/安全）
- 先列出结构化大纲，再补充细节
- 不确定的地方要说“不确定”并给出合理猜测

回答要求：
- 使用中文为主，重要名词给出中英文
- 涉及实验操作时，需要提醒安全注意事项
`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const userMessage: string = messages[messages.length - 1]?.content || '';

    const role = detectRole(userMessage);
    const prefix = rolePrefix(role);

    const systemMessage = {
      role: 'system',
      content: BASE_SYSTEM_PROMPT + '\n\n' + prefix,
    };

    const payload = {
      model: DEFAULT_MODEL_NAME,
      messages: [systemMessage, ...messages],
      stream: false,
    };

    const res = await fetch(`${IFLOW_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.IFLOW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('iFlow error', text);
      return NextResponse.json({ error: text }, { status: 500 });
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content ?? '';

    return NextResponse.json({ reply, role });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}