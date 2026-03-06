#!/bin/bash

# 家庭物品管理系统 API 监控脚本
# 检测服务状态，异常时自动重启并通过飞书告警

API_URL="http://localhost:3000/api/health"
FEISHU_WEBHOOK="https://open.feishu.cn/open-apis/bot/v2/hook/YOUR_WEBHOOK_TOKEN"
LOG_FILE="/tmp/api_monitor.log"
MAX_RETRIES=3
RETRY_COUNT=0

# 记录日志
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# 发送飞书告警
send_feishu_alert() {
    local message="$1"
    local status="$2"
    
    # 构建飞书消息卡片
    local payload=$(cat <<EOF
{
    "msg_type": "interactive",
    "card": {
        "config": {
            "wide_screen_mode": true
        },
        "header": {
            "title": {
                "tag": "plain_text",
                "content": "🚨 物品管理系统告警"
            },
            "template": "${status}"
        },
        "elements": [
            {
                "tag": "div",
                "text": {
                    "tag": "lark_md",
                    "content": "${message}"
                }
            },
            {
                "tag": "div",
                "text": {
                    "tag": "lark_md",
                    "content": "**时间：** $(date '+%Y-%m-%d %H:%M:%S')\n**主机：** $(hostname)"
                }
            }
        ]
    }
}
EOF
)
    
    # 发送告警（使用 message 工具）
    curl -s -X POST -H "Content-Type: application/json" \
        -d "$payload" \
        "$FEISHU_WEBHOOK" > /dev/null 2>&1
    
    log_message "已发送飞书告警: $message"
}

# 检查 API 状态
check_api() {
    local response
    local http_code
    
    response=$(curl -s -w "\n%{http_code}" "$API_URL" 2>/dev/null)
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        if echo "$body" | grep -q '"status":"ok"'; then
            return 0
        fi
    fi
    
    return 1
}

# 重启服务
restart_service() {
    log_message "开始重启服务..."
    
    # 杀死现有进程
    pkill -f "node.*app.js" 2>/dev/null
    sleep 2
    
    # 启动服务
    cd /home/openclaw/.openclaw/workspace/family-inventory/backend
    nohup npm run dev > /tmp/backend.log 2>&1 &
    
    sleep 5
    
    # 验证重启
    if check_api; then
        log_message "服务重启成功"
        return 0
    else
        log_message "服务重启失败"
        return 1
    fi
}

# 主监控逻辑
main() {
    log_message "=== API 监控检查开始 ==="
    
    if check_api; then
        log_message "✅ API 服务正常"
        exit 0
    fi
    
    log_message "❌ API 服务异常，HTTP状态码非200"
    
    # 尝试自动重启
    if restart_service; then
        send_feishu_alert "⚠️ **服务异常已自动恢复**\n\n检测到物品管理系统 API 异常，已自动重启服务并恢复正常。\n\n✅ 当前状态：服务运行正常" "green"
    else
        send_feishu_alert "🚨 **服务异常需人工介入**\n\n检测到物品管理系统 API 异常，自动重启失败！\n\n❌ 当前状态：服务仍不可用\n\n请检查服务器状态和日志：\n- 日志文件：/tmp/backend.log\n- 监控日志：$LOG_FILE" "red"
    fi
    
    log_message "=== API 监控检查结束 ==="
}

# 执行主函数
main
