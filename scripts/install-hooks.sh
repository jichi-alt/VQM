#!/bin/bash

# 安装 Git Hooks
# 每次git commit前自动检查核心组件

echo "🔧 安装 VQM Git Hooks..."

# 创建 git hooks 目录
mkdir -p .git/hooks

# 创建 pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

# VQM Pre-commit Hook
# 每次提交前检查核心组件

echo "🔍 运行核心组件检查..."

# 运行检查脚本
./scripts/check-core-changes.sh

# 检查脚本的退出码
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ 检查失败！提交已取消。"
    echo ""
    echo "💡 修复错误后再次提交，或使用 --no-verify 跳过检查:"
    echo "   git commit --no-verify -m '你的提交信息'"
    echo ""
    exit 1
fi

echo "✅ 检查通过，继续提交..."
exit 0
EOF

# 添加执行权限
chmod +x .git/hooks/pre-commit

echo "✅ Git Hooks 安装完成！"
echo ""
echo "📋 现在每次 git commit 时会自动:"
echo "   ✓ 检查 React Hook 规则"
echo "   ✓ 验证 TypeScript 语法"
echo "   ✓ 检查导入语句"
echo "   ✓ 验证文件结构"
echo "   ✓ 运行完整编译检查"
echo ""
echo "💡 如果要跳过检查，使用:"
echo "   git commit --no-verify -m '你的信息'"
echo ""
