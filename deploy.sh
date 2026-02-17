#!/bin/bash
# Vercel 直接部署脚本
# 绕过 Git 集成问题，直接从本地部署

echo "🚀 开始部署到 Vercel..."
echo ""

# 1. 本地构建验证
echo "📦 步骤 1: 本地构建验证..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ 本地构建失败，请先检查错误"
  exit 1
fi
echo "✓ 本地构建成功"
echo ""

# 2. 部署到 Vercel 生产环境
echo "📤 步骤 2: 部署到 Vercel..."
echo "如果这是第一次运行，系统会提示您登录 Vercel"
echo ""

npx vercel --prod

echo ""
echo "✅ 部署完成！"
echo "请在浏览器中访问您的 Vercel URL 验证部署结果"
