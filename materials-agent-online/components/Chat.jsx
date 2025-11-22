import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "你好，我是 MOF 实验智能助理，请问你今天在做哪种反应？",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // 统一发送函数：既可以发输入框，也可以发预设文本
  const send = async (presetText) => {
    const content = (presetText ?? input).trim();
    if (!content) return;

    const newMessages = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setInput(""); // 清空输入框
    setLoading(true);

    try {
  const res = await axios.post(
  "/api/chat",
  { messages: newMessages },
  { headers: { "Content-Type": "application/json" } }
);
      setMessages([
        ...newMessages,
        { role: "assistant", content: res.data.reply },
      ]);
    } catch (err) {
      console.error(err);
      let msg = "出错了：无法联系后端。";
      if (err.response) {
        msg = `后端错误：${err.response.status}\n${JSON.stringify(
          err.response.data
        )}`;
      }
      setMessages([
        ...newMessages,
        { role: "assistant", content: msg },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-box" style={{ padding: 20 }}>
      <h2>材料与化工智能助理</h2>
      <p style={{ color: "#555" }}>
        你好，我是 MOF 实验智能助理，请尽量详细告诉我配体、金属盐、溶剂、温度和时间 😊
      </p>

      {/* ✅ 快捷提问按钮 */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          margin: "8px 0 12px",
        }}
      >
        <button
          onClick={() =>
            send("使用尿酸 (Uric Acid) 与三苯基氰杂环 (TCNQ) 合成 Urea-TCNQ MOF 的具体条件？")
          }
        >
          Urea-TCNQ MOF 合成
        </button>
        <button onClick={() => send("我想优化 MOF 蓝光发射性能，应该从哪些配体和金属入手？")}>
          蓝光发射 MOF 设计
        </button>
        <button onClick={() => send("我的 MOF 晶体老是长不出来，可能有哪些原因？")}>
          晶体长不出来排查
        </button>
      </div>

      <div
        style={{
          minHeight: 300,
          maxHeight: 420,
          overflowY: "auto",
          padding: 10,
          border: "1px solid #f0f0f0",
          borderRadius: 8,
          background: "#fbfcff",
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={"message " + (m.role === "user" ? "user" : "assistant")}
            style={{ margin: "10px 0" }}
          >
            <div style={{ fontSize: 12, color: "#888" }}>
              {m.role === "user" ? "你" : "助理"}
            </div>
            <div
              style={{
                display: "inline-block",
                padding: 10,
                borderRadius: 8,
                background: m.role === "user" ? "#dfefff" : "#fff",
                maxWidth: "90%",
                whiteSpace: "pre-wrap", // ✅ 支持多行
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>

      <div style={{ display: "flex", marginTop: 12 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder="描述你的问题或输入实验条件（例如：0.1M Zn(NO3)2 + 0.05M 配体，DMF，85°C，48h）"
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={() => send()}
          disabled={loading}
          style={{ marginLeft: 8, padding: "10px 16px" }}
        >
          {loading ? "..." : "发送"}
        </button>
      </div>
    </div>
  );
}
