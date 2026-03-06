#!/bin/bash

# 家庭物品管理系统 API 监控脚本
# 检测服务状态，异常时自动重启并生成告警文件

API_URL="http://localhost:3000/api/health"
LOG_FILE="/tmp/api_monitor.log"
ALERT_FILE="/tmp/api_monitor_needs_alert"
RESTART_LOCK="/tmp/api_monitor_restarting"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始监控检查..." >> "$LOG_FILE"

# 检查 API
if curl -s "$API_URL" | grep -q '"status":"ok"'; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ API 正常" >> "$LOG_FILE"
    # 如果之前有告警，现在恢复了
    if [ -f "$ALERT_FILE" ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] 服务已恢复" >> "$LOG_FILE"
        rm -f "$ALERT_FILE"
    fi
    exit 0
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ API 异常" >> "$LOG_FILE"

# 检查是否正在重启中
if [ -f "$RESTART_LOCK" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 正在重启中，跳过" >> "$LOG_FILE"
    exit 0
fi

# 创建重启锁
touch "$RESTART_LOCK"

# 尝试重启服务
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始重启服务..." >> "$LOG_FILE"

# 杀死现有进程
pkill -f "node.*app.js" 2>/dev/null || true
sleep 2

# 启动服务
cd /home/openclaw/.openclaw/workspace/family-inventory/backend
nohup npm run dev > /tmp/backend.log 2>&1 &
echo $! > /tmp/backend.pid

# 等待服务启动
sleep 5

# 验证重启
if curl -s "$API_URL" | grep -q '"status":"ok"'; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ 重启成功" >> "$LOG_FILE"
    echo "recovered|$(date '+%Y-%m-%d %H:%M:%S')|服务已自动恢复" > "$ALERT_FILE"
    rm -f "$RESTART_LOCK"
    exit 0
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ 重启失败" >> "$LOG_FILE"
    echo "failed|$(date '+%Y-%m-%d %H:%M:%S')|自动重启失败，需人工介入" > "$ALERT_FILE"
    rm -f "$RESTART_LOCK"
    exit 1
fi
