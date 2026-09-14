# 🌍 LinguaFlow — 沉浸式英语学习平台

一款面向英语学习者的在线教育平台，提供分级课程、互动学习模块、进度追踪、个性化推荐、社区交流与成就激励系统。

## ✨ 核心功能

- **分级课程体系**：A1–C2 共 6 个等级，18 个单元，54 个课时
- **单词记忆**：闪卡翻转 + 拼写测试 + 单词本收藏
- **语法练习**：选择题 / 填空题，即时反馈对错与解析
- **口语跟读**：TTS 标准发音 + 语音识别 + 相似度评分
- **听力训练**：TTS 音频播放 + 答题 + 听力原文对照
- **进度追踪**：学习统计 + 可视化图表
- **个性化推荐**：基于水平与薄弱项的智能推荐
- **社区交流**：发帖、评论、点赞
- **成就激励**：徽章解锁、积分累计、排行榜

## 🛠 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React 18 + TypeScript + Vite + Tailwind CSS + Recharts |
| 后端 | Node.js + Express + TypeScript + SQLite (better-sqlite3) |
| 认证 | JWT + bcryptjs |
| 语音 | 浏览器原生 Web Speech API |

## 🚀 快速开始

### 环境要求
- Node.js >= 18
- npm >= 9

### 启动

```bash
# 1. 后端
cd server
npm install
npm run seed        # 初始化数据库与种子数据
npm run dev         # 启动后端 (http://localhost:3001)

# 2. 前端 (新终端)
cd client
npm install
npm run dev         # 启动前端 (http://localhost:5173)
```

访问 http://localhost:5173

演示账号：`demo` / `demo123`

## 📚 文档

- [技术文档](./TECHNICAL_DOC.md)
- [部署指南](./DEPLOYMENT_GUIDE.md)

## 📁 目录结构

```
.
├── server/          # 后端 (Express + SQLite)
│   └── src/
│       ├── routes/  # API 路由
│       ├── db.ts    # 数据库 Schema
│       └── seed.ts  # 种子数据
└── client/          # 前端 (React + Vite)
    └── src/
        ├── pages/   # 页面组件
        └── api.ts   # API 封装
```

## 🌐 浏览器兼容性

- 基础功能：所有现代浏览器
- 听力/口语发音 (SpeechSynthesis)：Chrome / Edge / Firefox / Safari
- 口语录音识别 (SpeechRecognition)：**Chrome / Edge**（需 HTTPS 或 localhost）

## 📄 License

MIT
