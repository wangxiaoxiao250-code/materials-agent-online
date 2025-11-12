import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "../styles/globals.css";

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "你好，我是 MOF 实验智能助理，请问你今天在做哪种反应？" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await axios.post("/api/chat", { messages: newMessages });
      setMessages([...newMessages, { role: "assistant", content: res.data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: "assistant", content: "出错了：无法联系后端。" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-box" style={{padding:20}}>
      <h2>材料与化工智能助理</h2>
      <p style={{color:'#555'}}>你好，我是 MOF 实验智能助理，请问你今天在做哪种反应？</p>
      <div style={{minHeight:300, maxHeight:420, overflowY:"auto", padding:10, border:"1px solid #f0f0f0", borderRadius:8, background:"#fbfcff"}}>
        {messages.map((m, i) => (
          <div key={i} className={"message " + (m.role === "user" ? "user" : "assistant")} style={{margin:'10px 0'}}>
            <div style={{fontSize:12, color:'#888'}}>{m.role === "user" ? "你" : "助理"}</div>
            <div style={{display:'inline-block', padding:10, borderRadius:8, background: m.role === "user" ? "#dfefff" : "#fff", maxWidth:'90%'}}>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>

      <div style={{display:'flex', marginTop:12}}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") send(); }}
          placeholder="描述你的问题或输入实验条件（例如：0.1M Zn(NO3)2 + 0.05M 配体，DMF，85°C，48h）"
          style={{flex:1, padding:10, borderRadius:6, border:"1px solid #ccc"}}
        />
        <button onClick={send} disabled={loading} style={{marginLeft:8, padding:'10px 16px'}}>{loading ? "..." : "发送"}</button>
      </div>
    </div>
  );
}
