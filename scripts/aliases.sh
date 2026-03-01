# VQM 项目常用别名
# 添加到 ~/.bashrc 或 ~/.zshrc

# 快速检查
alias vqm-check='./scripts/check-core-changes.sh'
alias vqm-check-all='./scripts/check-core-changes.sh --force'

# 快速修复
alias vqm-fix='./scripts/fix.sh'
alias vqm-restart='./scripts/fix.sh'

# 诊断
alias vqm-diag='./scripts/diagnose.sh'

# 日志
alias vqm-log='tail -f logs/vite-server.log'
alias vqm-logs='tail -100 logs/vite-server.log'

# Git操作
alias vqm-commit='git commit -v'
alias vqm-status='git status'

# 服务器
alias vqm-start='npm run dev > logs/vite-server.log 2>&1 &'
alias vqm-stop='pkill -f vite'

# 编译
alias vqm-build='npm run build'

# 完整工作流
alias vqm-work='vqm-check && vqm-fix'

echo "✅ VQM 别名已加载！"
echo ""
echo "可用命令:"
echo "  vqm-check      - 检查代码改动"
echo "  vqm-fix        - 一键修复服务器"
echo "  vqm-diag       - 诊断项目状态"
echo "  vqm-log        - 查看实时日志"
echo "  vqm-work       - 完整工作流（检查+修复）"
echo ""
