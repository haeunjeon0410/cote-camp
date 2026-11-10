// 문제 공장이 쓰는 AI 호출: API 게이트웨이(Anthropic Messages API 프록시)로 도구 호출 한 번을 보낸다.
// 키(SCHOOL_GATEWAY_API_KEY)는 .env 에서 읽고, 메인 프로세스에서만 쓴다 (화면 코드에는 넘기지 않는다).
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://factchat-cloud.mindlogic.ai/v1/gateway/claude/v1/messages/';
const ANTHROPIC_VERSION = '2023-06-01';
const DEFAULT_MODEL = 'claude-sonnet-5';
const RETRY_DELAYS_MS = [1000, 3000];
const RETRYABLE = new Set([429, 500, 502, 503, 504, 529]);

function loadEnv(dir) {
  try {
    for (const line of fs.readFileSync(path.join(dir, '.env'), 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*?)"?\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch (e) { /* .env 없음 */ }
}

const hasKey = () => !!process.env.SCHOOL_GATEWAY_API_KEY;
const modelName = () => process.env.GRADE_MODEL || DEFAULT_MODEL;

async function callTool({ system, user, tool, maxTokens = 2500, model = modelName(), timeoutMs = 120000 }) {
  const apiKey = process.env.SCHOOL_GATEWAY_API_KEY;
  if (!apiKey) throw Object.assign(new Error('NO_KEY'), { code: 'NO_KEY' });
  const body = JSON.stringify({
    model,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: [{ type: 'text', text: user }] }],
    tools: [tool],
    tool_choice: { type: 'tool', name: tool.name },
  });
  let lastErr;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    if (attempt > 0) await new Promise(r => setTimeout(r, RETRY_DELAYS_MS[attempt - 1]));
    try {
      const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': ANTHROPIC_VERSION },
        body,
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.stop_reason === 'max_tokens') throw Object.assign(new Error('응답이 너무 길어 잘렸어요. 다시 시도해 주세요.'), { code: 'TRUNCATED' });
        const block = (data.content || []).find(b => b.type === 'tool_use');
        if (!block) throw Object.assign(new Error('AI 응답 형식이 올바르지 않아요.'), { code: 'BAD_RESPONSE' });
        return { input: block.input, usage: data.usage || {} };
      }
      const text = await res.text();
      lastErr = Object.assign(new Error(`게이트웨이 오류 ${res.status}: ${text.slice(0, 300)}`), { code: 'HTTP', status: res.status });
      if (!RETRYABLE.has(res.status)) throw lastErr;
    } catch (e) {
      if (e === lastErr || e.code === 'TRUNCATED' || e.code === 'BAD_RESPONSE' || e.code === 'NO_KEY') throw e;
      lastErr = e;
    }
  }
  throw lastErr || new Error('AI 호출에 실패했어요.');
}

module.exports = { loadEnv, hasKey, modelName, callTool };
