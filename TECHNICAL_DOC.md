# LinguaFlow 英语学习平台 — 技术文档

> 版本：1.0.0  
> 更新日期：2026-09-15

## 目录

1. [项目概述](#1-项目概述)
2. [技术栈](#2-技术栈)
3. [系统架构](#3-系统架构)
4. [目录结构](#4-目录结构)
5. [数据库设计](#5-数据库设计)
6. [后端接口文档](#6-后端接口文档)
7. [前端模块说明](#7-前端模块说明)
8. [核心业务逻辑](#8-核心业务逻辑)
9. [环境变量与配置](#9-环境变量与配置)
10. [安全设计](#10-安全设计)
11. [浏览器兼容性](#11-浏览器兼容性)

---

## 1. 项目概述

LinguaFlow 是一款面向英语学习者的沉浸式在线教育平台，提供从入门（A1）到精通（C2）的分级课程体系，配合单词记忆、语法练习、口语跟读、听力训练四大互动模块，并通过学习进度追踪、个性化推荐、社区交流和成就激励系统，构建完整的学习闭环。

### 核心功能

| 模块 | 说明 |
|------|------|
| 分级课程体系 | A1–C2 共 6 个等级，每级 3 个单元，共 54 个课时 |
| 单词记忆 | 闪卡翻转、拼写测试、单词本收藏 |
| 语法练习 | 选择题、填空题，即时反馈对错与解析 |
| 口语跟读 | TTS 标准发音 + 语音识别 + Levenshtein 相似度评分 |
| 听力训练 | TTS 音频播放 + 答题 + 听力原文对照 |
| 进度追踪 | 课时完成度、正确率、学习时长统计 + 可视化图表 |
| 个性化推荐 | 基于用户等级、已完成课时、薄弱项推荐学习内容 |
| 社区交流 | 发帖、评论、点赞、分类浏览 |
| 成就激励 | 8 种徽章自动解锁、积分累计、排行榜 |

---

## 2. 技术栈

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | >= 18 | 运行环境 |
| Express | ^4.21.0 | Web 框架 |
| TypeScript | ^5.6.2 | 类型安全 |
| better-sqlite3 | ^11.3.0 | SQLite 数据库驱动（同步 API） |
| jsonwebtoken | ^9.0.2 | JWT 鉴权 |
| bcryptjs | ^2.4.3 | 密码哈希 |
| cors | ^2.8.5 | 跨域支持 |
| tsx | ^4.19.1 | TypeScript 开发运行时（热重载） |

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| React | ^18.3.1 | UI 框架 |
| TypeScript | ^5.6.2 | 类型安全 |
| Vite | ^5.4.8 | 构建工具与开发服务器 |
| React Router | ^6.26.2 | 前端路由 |
| Tailwind CSS | ^3.4.13 | 原子化 CSS 框架 |
| Recharts | ^2.12.7 | 数据可视化图表 |

### 浏览器原生能力

- **Web Speech API — SpeechSynthesis**：听力音频播放、口语标准发音
- **Web Speech API — SpeechRecognition**（含 webkit 前缀兼容）：口语录音识别

> 注：语音功能依赖浏览器原生能力，无需后端音频服务。推荐使用 Chrome / Edge 获得最佳体验。

---

## 3. 系统架构

```
┌─────────────────────────────────────────────────────┐
│                    浏览器 (Client)                    │
│  React SPA (Vite) · Tailwind · Recharts               │
│  ┌───────────────────────────────────────────────┐   │
│  │  页面层：Dashboard / Courses / Vocabulary / ... │   │
│  │  状态层：AuthContext (JWT + localStorage)       │   │
│  │  API 层：api.ts (fetch 封装)                    │   │
│  └───────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP /api (开发态 Vite Proxy)
                       ▼
┌─────────────────────────────────────────────────────┐
│                  后端 (Server)                        │
│  Express + TypeScript                                 │
│  ┌───────────────────────────────────────────────┐   │
│  │  中间件：CORS · JSON Body · JWT Auth           │   │
│  │  路由层：9 个路由模块                           │   │
│  │  数据层：better-sqlite3 (linguaflow.db)         │   │
│  └───────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 架构特点

- **前后端分离**：前端 Vite 开发服务器（5173）通过代理转发 `/api` 到后端（3001）；生产环境前端打包为静态文件由 Nginx 托管
- **单文件数据库**：SQLite 存储于 `server/linguaflow.db`，WAL 模式提升并发性能
- **无状态认证**：JWT 存储于客户端 localStorage，每次请求通过 `Authorization: Bearer <token>` 携带

---

## 4. 目录结构

```
/workspace
├── server/                          # 后端
│   ├── src/
│   │   ├── index.ts                 # 入口：Express 初始化、路由挂载
│   │   ├── db.ts                    # 数据库连接 + 16 张表 Schema
│   │   ├── seed.ts                  # 种子数据脚本
│   │   ├── middleware/
│   │   │   └── auth.ts              # JWT 鉴权中间件 + signToken
│   │   └── routes/
│   │       ├── auth.ts              # 注册/登录/登出/当前用户
│   │       ├── courses.ts           # 课程/单元/课时查询
│   │       ├── vocabulary.ts        # 单词 + 单词本
│   │       ├── grammar.ts           # 语法题
│   │       ├── listening.ts         # 听力题 + 口语句子
│   │       ├── progress.ts          # 进度记录 + 统计
│   │       ├── recommendations.ts   # 个性化推荐
│   │       ├── community.ts         # 帖子/评论/点赞
│   │       └── achievements.ts      # 徽章/排行榜
│   ├── linguaflow.db                # SQLite 数据库文件
│   ├── package.json
│   └── tsconfig.json
│
└── client/                          # 前端
    ├── src/
    │   ├── main.tsx                 # React 入口
    │   ├── App.tsx                  # 路由配置
    │   ├── api.ts                   # 统一 API 请求封装
    │   ├── index.css                # Tailwind + 全局样式 + 闪卡动画
    │   ├── context/
    │   │   └── AuthContext.tsx      # 认证状态管理
    │   ├── components/
    │   │   ├── Navbar.tsx           # 顶部导航栏
    │   │   └── ProtectedRoute.tsx   # 路由守卫
    │   └── pages/
    │       ├── Login.tsx
    │       ├── Register.tsx
    │       ├── Dashboard.tsx        # 首页 + 个性化推荐
    │       ├── Courses.tsx
    │       ├── CourseDetail.tsx
    │       ├── LessonDetail.tsx
    │       ├── Vocabulary.tsx       # 单词闪卡 + 拼写测试
    │       ├── Grammar.tsx          # 语法练习
    │       ├── Speaking.tsx         # 口语跟读
    │       ├── Listening.tsx        # 听力训练
    │       ├── Progress.tsx         # 进度统计 + 图表
    │       ├── Community.tsx        # 社区列表
    │       ├── PostDetail.tsx       # 帖子详情
    │       └── Achievements.tsx     # 徽章 + 排行榜
    ├── index.html
    ├── package.json
    ├── vite.config.ts               # Vite 配置 + /api 代理
    ├── tailwind.config.js
    └── tsconfig.json
```

---

## 5. 数据库设计

数据库使用 SQLite，共 16 张表。数据库文件位于 `server/linguaflow.db`，启用 WAL 模式和外键约束。

### 5.1 表结构概览

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `users` | 用户 | id, username, email, password(bcrypt), level, points, avatar |
| `courses` | 课程等级 | id, level(A1-C2), title, description, color |
| `units` | 单元 | id, course_id, title, sort_order |
| `lessons` | 课时 | id, unit_id, title, sort_order |
| `vocabulary` | 单词 | id, word, phonetic, meaning, example, level |
| `grammar_questions` | 语法题 | id, level, type(choice/fill), question, options(JSON), answer, explanation |
| `listening_questions` | 听力题 | id, level, audio_text, question, options, answer |
| `speaking_sentences` | 口语句子 | id, level, sentence, translation |
| `progress` | 学习进度 | id, user_id, lesson_id, type, correct, total, duration |
| `completed_lessons` | 已完成课时 | user_id, lesson_id, completed_at |
| `user_words` | 单词本 | id, user_id, word_id |
| `posts` | 帖子 | id, user_id, title, content, category, likes |
| `comments` | 评论 | id, post_id, user_id, content |
| `likes` | 点赞 | user_id, post_id |
| `badges` | 徽章定义 | id, name, description, icon, condition_type, condition_value, points |
| `user_badges` | 用户徽章 | user_id, badge_id, earned_at |

### 5.2 核心关系

```
users ──1:N── progress
users ──1:N── completed_lessons ──N:1── lessons
users ──1:N── user_words ──N:1── vocabulary
users ──1:N── posts ──1:N── comments
users ──N:N── badges (through user_badges)

courses ──1:N── units ──1:N── lessons
```

### 5.3 种子数据

运行 `npm run seed` 可初始化以下数据：

| 数据 | 数量 |
|------|------|
| 课程等级 | 6（A1–C2） |
| 单元 | 18 |
| 课时 | 54 |
| 单词 | 87（覆盖 A1–C2） |
| 语法题 | 30（选择题 + 填空题） |
| 听力题 | 15 |
| 口语句子 | 14 |
| 徽章 | 8 |
| 演示用户 | 1（`demo` / `demo123`） |

---

## 6. 后端接口文档

所有接口前缀为 `/api`，响应统一为 JSON。需要鉴权的接口需在请求头携带 `Authorization: Bearer <token>`。

### 6.1 健康检查

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/health` | 否 | 服务健康检查 |

响应：`{ "status": "ok", "message": "LinguaFlow API is running" }`

### 6.2 用户认证 `/api/auth`

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| POST | `/api/auth/register` | 否 | 用户注册 |
| POST | `/api/auth/login` | 否 | 用户登录 |
| GET | `/api/auth/me` | 是 | 获取当前用户信息 |
| POST | `/api/auth/logout` | 是 | 退出登录 |

**注册请求体：**
```json
{ "username": "string", "email": "string", "password": "string" }
```
响应 `201`：`{ "token": "jwt...", "user": { "id", "username", "email", "level", "points" } }`

**登录请求体：**
```json
{ "username": "string", "password": "string" }
```
响应 `200`：同上。错误密码返回 `401`。

### 6.3 课程体系 `/api/courses`

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/courses` | 否 | 获取所有等级课程 |
| GET | `/api/courses/:id/units` | 否 | 获取某课程的单元列表 |
| GET | `/api/courses/units/:id/lessons` | 否 | 获取某单元的课时列表 |
| GET | `/api/courses/lessons/:id` | 否 | 获取课时详情（含单元、课程信息） |

### 6.4 单词 `/api/vocabulary`

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/vocabulary?level=A1` | 否 | 按等级获取单词列表 |
| GET | `/api/vocabulary/user-words` | 是 | 获取我的单词本 |
| POST | `/api/vocabulary/user-words` | 是 | 收藏单词（body: `{ word_id }`） |
| DELETE | `/api/vocabulary/user-words/:wordId` | 是 | 取消收藏 |

### 6.5 语法 `/api/grammar`

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/grammar?level=A1` | 否 | 获取语法题（options 字段已解析为数组） |

### 6.6 听力与口语 `/api/listening`

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/listening?level=A1` | 否 | 获取听力题 |
| GET | `/api/listening/sentences?level=A1` | 否 | 获取口语练习句子 |

### 6.7 学习进度 `/api/progress`

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| POST | `/api/progress` | 是 | 记录学习行为 |
| GET | `/api/progress/stats` | 是 | 获取学习统计 |
| GET | `/api/progress/completed-lessons` | 是 | 获取已完成课时列表 |

**记录进度请求体：**
```json
{ "lesson_id": 1, "type": "lesson|grammar|spelling|listening", "correct": 1, "total": 1, "duration": 5 }
```
`type=lesson` 时会同时写入 `completed_lessons` 表。每次记录会根据正确数和课时类型增加积分，并自动检查徽章解锁条件。

**统计响应：**
```json
{
  "completedLessons": 3,
  "correct": 25,
  "total": 30,
  "accuracy": 83,
  "duration": 120,
  "points": 320,
  "level": "A1",
  "weekly": [{ "date": "2026-09-10", "count": 5, "duration": 30 }]
}
```

### 6.8 个性化推荐 `/api/recommendations`

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/recommendations` | 是 | 获取个性化推荐 |

**响应：**
```json
{
  "currentLevel": "A1",
  "nextLessons": [{ "id", "title", "unit_title", "level", "course_title" }],
  "reviewLessons": [...],
  "message": "继续你当前等级的学习吧！"
}
```

**推荐逻辑：**
1. `nextLessons`：用户当前等级下未完成的课时（按单元、课时排序）
2. `reviewLessons`：正确率低于 60% 的等级对应的复习课时

### 6.9 社区 `/api/posts`

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/posts?category=general` | 否 | 获取帖子列表（支持分类筛选） |
| GET | `/api/posts/:id` | 否 | 获取帖子详情 + 评论 |
| POST | `/api/posts` | 是 | 发布帖子 |
| POST | `/api/posts/:id/comments` | 是 | 发表评论 |
| POST | `/api/posts/:id/like` | 是 | 点赞/取消点赞（切换） |
| GET | `/api/posts/:id/liked` | 是 | 查询当前用户是否已点赞 |

### 6.10 成就系统 `/api`

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/badges` | 是 | 获取徽章列表（含 earned 字段） |
| GET | `/api/my-badges` | 是 | 获取已获得的徽章 |
| GET | `/api/leaderboard` | 否 | 获取排行榜（按积分降序，前 20） |

---

## 7. 前端模块说明

### 7.1 路由结构

```
/login          登录页（公开）
/register       注册页（公开）
/               首页仪表盘（需登录）
/courses        课程列表（需登录）
/courses/:id    课程详情（单元列表，需登录）
/lessons/:id    课时详情（需登录）
/vocabulary     单词记忆（需登录）
/grammar        语法练习（需登录）
/speaking       口语跟读（需登录）
/listening      听力训练（需登录）
/progress       学习进度（需登录）
/community      社区列表（需登录）
/community/:id  帖子详情（需登录）
/achievements   成就中心（需登录）
```

### 7.2 认证状态管理

`AuthContext` 提供全局认证状态：

- `user`：当前用户对象（id, username, email, level, points, avatar）
- `token`：JWT，持久化于 `localStorage`
- `login(username, password)`：登录并存储 token
- `register(username, email, password)`：注册并自动登录
- `logout()`：清除 token 与用户状态
- `refreshUser()`：刷新用户信息（积分变更后调用）

### 7.3 API 请求封装

`api.ts` 统一封装 fetch 请求，自动：
- 从 `localStorage` 读取 token 并附加到 `Authorization` 头
- 设置 `Content-Type: application/json`
- 统一错误抛出，页面可通过 try/catch 处理

### 7.4 各页面功能

| 页面 | 核心功能 |
|------|----------|
| Dashboard | 欢迎横幅（统计数据）、个性化推荐卡片、快速入口、课程等级入口 |
| Courses | 6 等级卡片网格，点击进入课程详情 |
| CourseDetail | 手风琴式展开单元与课时列表 |
| LessonDetail | 课时内容、配套练习入口、标记完成（获积分+徽章） |
| Vocabulary | 闪卡模式（3D 翻转）、拼写测试模式、等级切换、单词本收藏 |
| Grammar | 选择/填空题作答、即时对错反馈与解析、答题计分 |
| Speaking | TTS 播放标准发音、SpeechRecognition 录音、相似度评分（0-100） |
| Listening | TTS 播放音频、答题、查看听力原文 |
| Progress | 统计卡片、近 7 天学习时长/练习次数柱状图、等级进度条 |
| Community | 帖子列表、分类筛选、发帖表单 |
| PostDetail | 帖子内容、点赞、评论列表与发表 |
| Achievements | 徽章墙（已解锁/未解锁）、排行榜、我的排名 |

---

## 8. 核心业务逻辑

### 8.1 口语相似度评分

采用 **Levenshtein 编辑距离** 计算识别文本与标准文本的相似度：

```
相似度 = (1 - 编辑距离 / max(文本1长度, 文本2长度)) × 100
```

评分分级：
- `>= 80`：优秀（绿色）
- `50–79`：不错（橙色）
- `< 50`：再试一次（红色）

### 8.2 积分与徽章机制

**积分获取：**
- 每答对 1 题：+2 积分
- 每完成 1 课时：+10 积分
- 解锁徽章：按徽章定义额外奖励积分

**徽章自动解锁（`checkAndAwardBadges`）：**
每次记录进度时触发检查，支持以下条件类型：
- `completed_lessons`：完成课时数达到阈值
- `correct_answers`：累计答对数达到阈值
- `points`：积分达到阈值

### 8.3 个性化推荐算法

1. 读取用户当前 `level`
2. 查询该等级所有课时，过滤掉已完成的 → `nextLessons`
3. 通过 `progress JOIN lessons JOIN units JOIN courses` 计算各等级平均正确率
4. 正确率 < 60% 的等级，取其课时作为 `reviewLessons`

---

## 9. 环境变量与配置

### 后端环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `3001` | 后端服务端口 |
| `JWT_SECRET` | `linguaflow-secret-key-2024` | JWT 签名密钥（生产环境务必修改） |

### 前端配置

前端通过 `vite.config.ts` 配置开发代理：

```ts
server: {
  port: 5173,
  proxy: {
    '/api': 'http://localhost:3001',
  },
}
```

> 生产环境中前端打包为静态文件，`/api` 请求需由 Nginx 反向代理到后端，无需此代理配置。

---

## 10. 安全设计

| 安全项 | 实现方式 |
|--------|----------|
| 密码存储 | bcryptjs 哈希（salt rounds = 10），不明文存储 |
| 身份认证 | JWT（有效期 7 天），受保护路由校验 token |
| 跨域 | CORS 中间件（开发期全开放，生产可配置白名单） |
| SQL 注入 | better-sqlite3 预编译语句（参数化查询） |
| 路由守卫 | 前端 `ProtectedRoute` 重定向未登录用户 |
| 外键约束 | SQLite `PRAGMA foreign_keys = ON` 保证数据完整性 |

### 生产环境加固建议

1. 修改 `JWT_SECRET` 为高强度随机字符串
2. 配置 CORS 白名单，限制允许的来源域名
3. 使用 HTTPS（配合 Nginx + Certbot）
4. 定期备份 `linguaflow.db` 数据库文件
5. 限制数据库文件访问权限（`chmod 600`）

---

## 11. 浏览器兼容性

| 功能 | 浏览器要求 |
|------|------------|
| 基础功能（课程、单词、语法、社区、成就） | 所有现代浏览器 |
| 听力训练（SpeechSynthesis） | Chrome、Edge、Firefox、Safari |
| 口语跟读（SpeechRecognition） | **Chrome、Edge**（Firefox/Safari 不支持，会显示友好提示） |

> 语音功能依赖浏览器原生 Web Speech API，不支持的浏览器会显示提示信息，不影响其他功能使用。
