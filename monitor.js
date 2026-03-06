const http = require('http');
const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');

const execPromise = util.promisify(exec);

// 配置
const CONFIG = {
  apiUrl: 'http://localhost:3000/api/health',
  logFile: '/tmp/api_monitor.log',
  serviceDir: '/home/openclaw/.openclaw/workspace/family-inventory/backend',
  feishuUser: 'ou_749f8a9148af5a2385ba658c83327990', // 你的飞书用户ID
  checkInterval: 60000, // 1分钟检查一次
  maxRetries: 3
};

// 日志函数
function log(message) {
  const timestamp = new Date().toLocaleString('zh-CN');
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(CONFIG.logFile, logMessage);
  console.log(logMessage.trim());
}

// 发送飞书消息（通过 OpenClaw CLI）
async function sendFeishuAlert(title, message, isError = false) {
  try {
    const emoji = isError ? '🚨' : '⚠️';
    const color = isError ? 'red' : 'orange';
    const status = isError ? '异常需人工介入' : '已自动恢复';
    
    // 构建消息内容
    const alertMessage = `${emoji} **${title}**\n\n${message}\n\n**告警时间：** ${new Date().toLocaleString('zh-CN')}\n**处理状态：** ${status}`;
    
    // 使用 OpenClaw message 工具发送
    // 注意：这里需要通过某种方式触发 message 工具
    // 实际使用时可以通过 cron 调用或者直接使用 message API
    
    log(`准备发送飞书告警: ${title}`);
    
    // 将告警写入文件，供外部读取
    const alertData = {
      type: 'api_monitor_alert',
      timestamp: new Date().toISOString(),
      title,
      message,
      isError,
      target: CONFIG.feishuUser
    };
    
    fs.writeFileSync('/tmp/api_monitor_alert.json', JSON.stringify(alertData, null, 2));
    
    return true;
  } catch (error) {
    log(`发送告警失败: ${error.message}`);
    return false;
  }
}

// 检查 API 状态
async function checkAPI() {
  return new Promise((resolve) => {
    const req = http.get(CONFIG.apiUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.status === 'ok');
        } catch {
          resolve(false);
        }
      });
    });
    
    req.on('error', () => resolve(false));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// 重启服务
async function restartService() {
  try {
    log('开始重启服务...');
    
    // 杀死现有进程
    await execPromise('pkill -f "node.*app.js" 2>/dev/null || true');
    await new Promise(r => setTimeout(r, 2000));
    
    // 启动服务
    const cmd = `cd ${CONFIG.serviceDir} && nohup npm run dev > /tmp/backend.log 2>&1 &`;
    await execPromise(cmd);
    
    // 等待服务启动
    await new Promise(r => setTimeout(r, 5000));
    
    // 验证
    const isHealthy = await checkAPI();
    if (isHealthy) {
      log('✅ 服务重启成功');
      return true;
    } else {
      log('❌ 服务重启失败');
      return false;
    }
  } catch (error) {
    log(`重启服务出错: ${error.message}`);
    return false;
  }
}

// 主监控函数
async function monitor() {
  log('=== API 监控检查开始 ===');
  
  const isHealthy = await checkAPI();
  
  if (isHealthy) {
    log('✅ API 服务正常');
    // 清理告警文件
    if (fs.existsSync('/tmp/api_monitor_alert.json')) {
      fs.unlinkSync('/tmp/api_monitor_alert.json');
    }
    return;
  }
  
  log('❌ API 服务异常，尝试自动恢复...');
  
  // 尝试重启
  const restartSuccess = await restartService();
  
  if (restartSuccess) {
    await sendFeishuAlert(
      '物品管理系统告警 - 已自动恢复',
      '检测到 API 服务异常，已自动重启并恢复正常。',
      false
    );
  } else {
    await sendFeishuAlert(
      '物品管理系统告警 - 需人工介入',
      '检测到 API 服务异常，自动重启失败！\n\n请检查：\n- 日志：/tmp/backend.log\n- 端口：3000 是否被占用\n- 数据库：SQLite 是否正常',
      true
    );
  }
  
  log('=== API 监控检查结束 ===');
}

// 立即执行一次
monitor().catch(err => log(`监控出错: ${err.message}`));
