// 게이트웨이 연결 확인: 아주 작은 호출 한 번 (키 값은 출력하지 않는다)
const path = require('path');
const ai = require('../ai');

ai.loadEnv(path.join(__dirname, '..'));
console.log('키 설정됨:', ai.hasKey(), '| 모델:', ai.modelName());

(async () => {
  const t0 = Date.now();
  try {
    const { input, usage } = await ai.callTool({
      system: '지시에 따라 도구를 호출하세요.',
      user: '"연결 확인"이라고 reply에 적어 주세요.',
      tool: {
        name: 'submit_coach',
        description: '응답 제출',
        input_schema: { type: 'object', properties: { reply: { type: 'string' } }, required: ['reply'] },
      },
      maxTokens: 100,
      timeoutMs: 60000,
    });
    console.log('성공:', JSON.stringify(input), '| 토큰', usage.input_tokens, '/', usage.output_tokens, '|', Date.now() - t0, 'ms');
  } catch (e) {
    console.log('실패:', e.code || '', e.message);
    process.exit(1);
  }
})();
