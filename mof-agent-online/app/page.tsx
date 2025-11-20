'use client';

import { useState } from 'react';

type Message = { role: 'user' | 'assistant'; content: string };

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();

      if (data.reply) {
        setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages([
          ...newMessages,
          { role: 'assistant', content: '后端返回错误，请检查日志。' },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages([
        ...newMessages,
        { role: 'assistant', content: '请求失败，请检查网络或后端。' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-md flex flex-col h-[80vh] overflow-hidden">
        <header className="p-4 border-b">
          <h1 className="text-xl font-bold">材料与化工智能体 · MOF Agent Online</h1>
          <p className="text-sm text-gray-500">
            面向 MOF 发光材料 / 非晶合金 / 高分子与成型工艺的学术助手（后端 iFlow · Qwen3-Coder）
          </p>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
          {messages.length === 0 && (
            <div className="text-gray-400 text-center mt-8">
              例子： “帮我设计一个蓝光发射 MOF 的表征方案（XRD+PL+TGA）”
            </div>
          )}
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={m.role === 'user' ? 'text-right' : 'text-left'}
            >
              <div
                className={
                  'inline-block px-3 py-2 rounded-lg ' +
                  (m.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900')
                }
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-left">
              <div className="inline-block px-3 py-2 rounded-lg bg-gray-100 text-gray-500">
                正在思考…
              </div>
            </div>
          )}
        </div>

        <footer className="p-4 border-t">
          <div className="flex gap-2">
            <textarea
              className="flex-1 border rounded-md p-2 text-sm resize-none h-16"
              placeholder="输入你的问题，按 Enter 发送，Shift+Enter 换行"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm disabled:opacity-50"
            >
              发送
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}