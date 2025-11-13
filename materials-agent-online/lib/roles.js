// lib/roles.js
// 简化版角色 + 高级智能体的“渐进式角色装载”

const ROLE_PROFILES = {
  // —— 基础：材料与化工专业智能体 ——
  "materials_basic": {
    thinking: "链式思考；先机理后结论；引用参数给出单位与范围；不确定处写明假设。",
    methods:  "查近5年综述→比对实验参数→给出可操作工艺窗口与注意事项。",
    knowledge:" 材料成型与控制、MOF/COF发光机理、聚合物物理、测试(PL/FTIR/TGA)。",
    style:    "中文为主；分点清晰；必要时用表格/序号。"
  },
  // —— 场景角色：MOF发光 ——
  "mof_luminescence": {
    thinking: "能级图→配位环境→AIE/ISC/RTP路径；先机理后参数建议。",
    methods:  "列出金属/配位/溶剂/温度/比例的调参窗；区分敏感与鲁棄参数。",
    knowledge:"MOF蓝光发射、配位场理论、π–π作用、限制内旋转(AIE)。"
  },
  // —— 场景角色：工艺放大/制程 ——
  "processing_scaleup": {
    thinking: "放大效应：传热/传质/应力场→工艺窗；风险点与对策。",
    methods:  "参数标定→DOE→SPC监控；记录材料批次差异。",
    knowledge:" 注塑/压铸/冷却/放缩率/模具设计要点。"
  },
  // —— 场景角色：IELTS（演示多角色能力） ——
  "ielts_academic": {
    thinking: "任务分解+结构化表达+常见语块与替换词。",
    methods:  "按评分标准给出改写建议与语法诊断。",
    knowledge:"IELTS Writing/Speaking 常规框架。"
  }
};

export function buildSystemPrompt(tags = []) {
  const picked = tags.map(t => ROLE_PROFILES[t]).filter(Boolean);
  const merged = picked.length ? picked : [ROLE_PROFILES["materials_basic"]];
  const blocks = merged.map((r, i) =>
    `\n思维模式：${r.thinking}\n研究方法：${r.methods}\n知识背景：${r.knowledge}`
  ).join("\n\n");
  return `你是“材料与化工智能体”。请遵循以下约束：\n${blocks}\n\n输出要求：给出清晰步骤；必要处列参数范围与单位；信息不足时写明假设及替代方案。`;
}

export function pickDynamicRoles(userInput, history = []) {
  const text = (userInput + " " + history.map(m => m.content || "").join(" ")).toLowerCase();
  const tags = new Set(["materials_basic"]); // 基础角色始终启用
  if (/(mof|金属有机骨枷|蓝光|发光|aie|磷|跃转|能级)/i.test(text)) tags.add("mof_luminescence");
  if (/(注塑|压铸|模具|scale|放大|量产|冷却|放缩|DOE)/i.test(text)) tags.add("processing_scaleup");
  if (/(ielts|雅思|写作|口说|academic)/i.test(text)) tags.add("ielts_academic");
  return [...tags];
}
