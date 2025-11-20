# MOF Agent Online

材料与化工智能体（MOF Agent Online），基于 Next.js 14 + iFlow OpenAI 兼容接口，实现面向材料与化工专业的学术智能体。

## 功能概述

- 本专业智能体角色：
  - 熟悉 MOF 发光材料、Zr 基非晶、高分子材料、材料成型与工艺等
  - 熟悉常见表征手段：XRD, FTIR, PL, TGA, NMR 等
  - 思维模式：先判断问题类型，再给出结构化大纲，最后补充细节
- 高级智能体（多角色）：
  - 文献分析助手（Literature Analyst）
  - 实验设计与表征助手（Experiment Planner）
  - 机理与数据分析助手（Mechanism & Data Analyst）
  - 学术写作助手（Academic Writer）
  - 后端根据用户问题关键词自动检测角色，并在 system prompt 中渐进式加载对应角色说明
- 使用 iFlow 提供的 OpenAI 兼容 API（示例模型：Qwen3-Coder）

## 本地运行

1. 安装依赖：

```bash
npm install
```

2. 配置环境变量：

复制 `.env.example` 为 `.env.local`，并填入你的 iFlow Key：

```bash
cp .env.example .env.local
# 编辑 .env.local，设置 IFLOW_API_KEY 和 IFLOW_MODEL_NAME
```

3. 启动开发环境：

```bash
npm run dev
```

浏览器访问：http://localhost:3000

## 部署到 Vercel

1. 将本项目推送到 GitHub（例如仓库名：mof-agent-online）
2. 打开 Vercel，选择「导入 Git 仓库」，选中该项目
3. 在 Vercel 的 Project Settings → Environment Variables 中添加：

- `IFLOW_API_KEY`：你的 iFlow API Key
- `IFLOW_MODEL_NAME`：Qwen3-Coder（或你习惯的模型名）

4. Deploy 完成后，会得到一个公开访问的 URL，可作为作业展示链接。

## 作业说明要点（可复制进报告）

- 说明本项目是面向材料与化工专业的智能体，具备清晰的领域角色设定
- 介绍高级智能体机制：根据对话场景自动切换「文献 / 实验 / 机理 / 写作」子角色
- 说明使用 iFlow 的 OpenAI 兼容 API 作为模型后端
- 展示本地运行界面截图 / Vercel 在线服务地址
- 如需补充 CLI 部分，可在终端使用 iFlow CLI、Qwen Code 等工具，对项目进行分析并截图