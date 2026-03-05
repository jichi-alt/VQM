# 星际日记（VQM Observation Station）

一个 21 天游思考挑战应用，包含打卡、记忆碎片、历史样本与档案馆功能。README 结构参考通用项目说明的实践范式，包含简介、功能、快速开始、环境变量和目录结构等必要部分。[[1](https://www.makeareadme.com/)] [[2](https://www.freecodecamp.org/news/how-to-structure-your-readme-file/)]

## 功能概览

- 21 天游思考挑战与连续打卡
- 每日问题生成与记录归档
- 记忆碎片解锁与档案馆回看
- 本地存储与云端同步（可选）

## 技术栈

- React + Vite + TypeScript
- Tailwind CSS
- Supabase（可选）

## 快速开始

1. 安装依赖  
   `npm install`
2. 启动开发服务器  
   `npm run dev`

快速开始部分包含安装、运行与验证流程，便于新成员在短时间内运行项目。[[2](https://www.freecodecamp.org/news/how-to-structure-your-readme-file/)]

## 环境变量

环境变量放在 `.env.local`，字段示例见 [.env.example](file:///c:/Users/WANG%20XINGYAO/VQM/.env.example)。建议在 README 中集中说明环境变量，避免误配置。[[2](https://www.freecodecamp.org/news/how-to-structure-your-readme-file/)]

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SENTRY_DSN`（可选）
- `VITE_GA_ID`（可选）
- `SITE_DOMAIN`

## 常用脚本

- 开发：`npm run dev`
- 构建：`npm run build`
- 预览：`npm run preview`
- 类型检查：`npm run type-check`

## 目录结构

```
VQM/
├── components/        主要 UI 组件
├── pages/             旧版页面（目前未接入主入口）
├── public/            静态资源
├── src/               业务与服务层
│   ├── services/      业务逻辑
│   ├── repository/    数据访问层
│   ├── types/         类型定义
│   └── lib/           工具库
├── docs/              记忆碎片文本（memory-fragments-stories.txt）
├── App.tsx            应用入口
└── package.json
```

## 部署要点

- 这是单页应用，需确保生产环境路由回退到 `index.html`
- 部署后如果有域名，需要设置 `SITE_DOMAIN` 以更新 SEO 文件
