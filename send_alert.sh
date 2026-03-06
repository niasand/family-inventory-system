#!/bin/bash

# 发送飞书告警脚本
# 读取告警文件并发送消息

ALERT_FILE="/tmp/api_monitor_needs_alert"
LOG_FILE="/tmp/api_monitor.log"

if [ ! -f "$ALERT_FILE" ]; then
    exit 0
fi

# 读取告警信息
ALERT_CONTENT=$(cat "$ALERT_FILE")
STATUS=$(echo "$ALERT_CONTENT" | cut -d'|' -f1)
TIME=$(echo "$ALERT_CONTENT" | cut -d'|' -f2)
MESSAGE=$(echo "$ALERT_CONTENT" | cut -d'|' -f3)

# 根据状态构建消息
if [ "$STATUS" = "recovered" ]; then
    MSG="⚠️ 物品管理系统告警 - 已自动恢复

${MESSAGE}

✅ 当前状态：服务运行正常
🕐 恢复时间：${TIME}
📍 服务地址：http://localhost:3000"
else
    MSG="🚨 物品管理系统告警 - 需人工介入

${MESSAGE}

❌ 当前状态：服务仍不可用
🕐 告警时间：${TIME}
📝 日志文件：
- 服务日志：/tmp/backend.log
- 监控日志：${LOG_FILE}

🔧 建议操作：
1. 检查服务器资源使用情况
2. 查看数据库连接是否正常
3. 检查端口 3000 是否被占用"
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 发送飞书告警: ${STATUS}" >> "$LOG_FILE"

# 输出消息（OpenClaw 会捕获并发送）
echo "$MSG"

# 清空告警文件
rm -f "$ALERT_FILE"
