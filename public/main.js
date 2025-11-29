import { checkApiStatus } from '../src/api/client.js';

const statusBadge = document.getElementById('status-badge');
const statusLog = document.getElementById('status-log');
const retryButton = document.getElementById('retry-button');

async function runStatusCheck() {
  statusBadge.textContent = '检测中…';
  statusBadge.style.color = '#f2c94c';
  statusLog.textContent = '';
  try {
    const { status, body } = await checkApiStatus();
    const ok = status >= 200 && status < 300 && body.ok !== false;
    statusBadge.textContent = ok ? '已连接' : '连接异常';
    statusBadge.style.color = ok ? '#42b883' : '#f2994a';
    statusLog.textContent = JSON.stringify(body, null, 2);
  } catch (error) {
    statusBadge.textContent = '配置缺失';
    statusBadge.style.color = '#eb5757';
    statusLog.textContent = error.message;
  }
}

retryButton.addEventListener('click', runStatusCheck);
runStatusCheck();
