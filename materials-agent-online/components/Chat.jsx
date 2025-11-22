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
    setInput("");
    setLoading(true);

    try {
      // ✅ 加上 headers，确保 Vercel 上 req.body 能解析到
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
      setMessages([...newMessages, { role: "assistant", content: msg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="chat-wrapper"
      style={{ maxWidth: 960, margin: "32px auto", padding: "0 16px" }}
    >
      {/* 顶部标题区域 */}
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ marginBottom: 4 }}>材料与化工智能助理</h2>
        <p style={{ color: "#555", fontSize: 14 }}>
          适用于 MOF 合成、发光材料、配体设计等问题。尽量写清楚金属盐、配体、溶剂、温度和时间哦 😊
        </p>
      </div>

      {/* 快捷问题按钮 */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <button
          className="quick-btn"
          onClick={() =>
            send(
              "使用尿酸 (Uric Acid) 与三苯基氰杂环 (TCNQ) 合成 Urea-TCNQ MOF，推荐给出一个可行的溶剂、温度、时间和浓度范围。"
            )
          }
        >
          Urea-TCNQ MOF 合成
        </button>
        <button
          className="quick-btn"
          onClick={() =>
            send("我想设计一个蓝光发射的 MOF，请从金属中心和配体结构两个角度给一些建议。")
          }
        >
          蓝光发射 MOF 设计
        </button>
        <button
          className="quick-btn"
          onClick={() =>
            send("我的 MOF 晶体老是长不出来或只有粉末，帮我分析 3~5 个常见原因和排查思路。")
          }
        >
          晶体长不出来排查
        </button>
      </div>

      {/* 对话区域 */}
      <div
        style={{
          minHeight: 300,
          maxHeight: 420,
          overflowY: "auto",
          padding: 10,
          border: "1px solid #f0f0f0",
          borderRadius: 8,
          background: "#fbfcff",
          boxShadow: "0 8px 20px rgba(15, 23, 42, 0.03)",
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={"message " + (m.role === "user" ? "user" : "assistant")}
            style={{ margin: "10px 0" }}
          >
            <div style={{ fontSize: 12, color: "#888", marginBottom: 2 }}>
              {m.role === "user" ? "你" : "助理"}
            </div>
            <div
              style={{
                display: "inline-block",
                padding: 10,
                borderRadius: 8,
                background: m.role === "user" ? "#dfefff" : "#fff",
                maxWidth: "90%",
                whiteSpace: "pre-wrap", // 支持多行+换行
                lineHeight: 1.6,
                fontSize: 14,
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* 输入区域 */}
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
            fontSize: 14,
          }}
        />
        <button
          onClick={() => send()}
          disabled={loading}
          style={{
            marginLeft: 8,
            padding: "10px 16px",
            borderRadius: 6,
            border: "none",
            background: loading ? "#ccc" : "#1677ff",
            color: "#fff",
            cursor: loading ? "default" : "pointer",
          }}
        >
          {loading ? "…" : "发送"}
        </button>
      </div>
    </div>
  );
}
