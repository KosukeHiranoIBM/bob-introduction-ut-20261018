/**
 * server.js — カウンセラー音声AIエージェント サーバー
 *
 * 役割：
 *   GET  /              → フロントエンドHTML配信
 *   POST /api/realtime-sdp → ブラウザのSDP offerをOpenAI Realtime APIへプロキシし
 *                            SDP answerを返す（APIキーはサーバー側のみ）
 *
 * OPENAI_API_KEY は process.env から読む。ブラウザへは渡さない。
 *
 * GA Realtime API: POST https://api.openai.com/v1/realtime/calls
 *   - Content-Type: application/sdp
 *   - ?model=<model>&voice=<voice>  (クエリパラメータ)
 *   - Body: SDP offer
 *   - Response: SDP answer (application/sdp)
 */

import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// SDP をそのまま受け取るため raw body パーサーを設定
app.use('/api/realtime-sdp', express.raw({ type: 'application/sdp', limit: '64kb' }));
app.use(express.json());

// ── APIキー確認（起動時のみ） ─────────────────────────────
if (!process.env.OPENAI_API_KEY) {
  console.warn('[WARN] OPENAI_API_KEY が設定されていません。');
  console.warn('       .env に OPENAI_API_KEY=sk-... を設定してください。');
}

// ── カウンセラーのシステム指示（サーバー固定。クライアントから変更不可） ──
const COUNSELOR_INSTRUCTIONS = `
あなたは優しく共感的な日本語カウンセラーです。
展示会でのデモ用に、3〜5分間の短い会話を想定しています。

【行動指針】
- 相手の話をまず丁寧に受け止め、感情に寄り添ってください。
- アドバイスより先に「どんな気持ちですか？」「もう少し教えてもらえますか？」と問いかけてください。
- 深刻な医療・法律判断が必要な内容には対応できないことを優しく伝え、専門家への相談を勧めてください。
- 日本語で、穏やかでゆっくりとした話し方をしてください。
- 個人情報（氏名・住所・連絡先等）を尋ねないでください。
- 会話は3〜5文程度の短い返答を心がけてください。

【最初の一言】
「こんにちは。今日はどんなことでお話ししましょうか？ゆっくりでいいですよ。」
`.trim();

// ── フロントエンド配信 ──────────────────────────────────
app.get('/', (_req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});
app.use(express.static(join(__dirname, 'public')));

// ── SDP offer プロキシ ─────────────────────────────────
/**
 * POST /api/realtime-sdp
 * Content-Type: application/sdp
 * Body: SDP offer (ブラウザのWebRTCが生成したもの)
 *
 * サーバーが OPENAI_API_KEY を付けて OpenAI へ転送し、
 * SDP answer をそのままブラウザへ返す。
 * APIキーはブラウザのネットワークには一切現れない。
 */
app.post('/api/realtime-sdp', async (req, res) => {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({
      error: 'API_KEY_NOT_CONFIGURED',
      message: 'サーバーに OPENAI_API_KEY が設定されていません。運営者に確認してください。',
    });
  }

  const sdpOffer = req.body?.toString?.() || req.body;
  if (!sdpOffer || typeof sdpOffer !== 'string') {
    return res.status(400).json({ error: 'INVALID_BODY', message: 'SDP offer が必要です。' });
  }

  const model = process.env.OPENAI_REALTIME_MODEL || 'gpt-realtime-2.1-mini';
  const voice = 'shimmer'; // 穏やかな女性系音声

  const openaiUrl = new URL('https://api.openai.com/v1/realtime/calls');
  openaiUrl.searchParams.set('model', model);
  openaiUrl.searchParams.set('voice', voice);
  openaiUrl.searchParams.set('instructions', COUNSELOR_INSTRUCTIONS);

  try {
    const openaiRes = await fetch(openaiUrl.toString(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/sdp',
      },
      body: sdpOffer,
    });

    const answerText = await openaiRes.text();

    if (!openaiRes.ok) {
      console.error('[realtime-sdp error]', openaiRes.status, answerText.slice(0, 300));

      const status = openaiRes.status;
      let message = `OpenAI APIへの接続に失敗しました（${status}）。`;
      if (status === 401) message = 'APIキーが無効です。運営者に確認してください。';
      if (status === 429) message = 'リクエストが多すぎます。少し待ってからお試しください。';

      return res.status(status).json({ error: 'OPENAI_ERROR', message });
    }

    // SDP answer をそのままブラウザへ返す
    res.set('Content-Type', 'application/sdp');
    res.send(answerText);
  } catch (err) {
    console.error('[realtime-sdp fetch error]', err?.message);
    res.status(500).json({
      error: 'FETCH_ERROR',
      message: `OpenAIへの通信中にエラーが発生しました: ${err?.message}`,
    });
  }
});

// ── 起動 ──────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
const server = createServer(app);
server.listen(PORT, () => {
  const model = process.env.OPENAI_REALTIME_MODEL || 'gpt-realtime-2.1-mini';
  console.log(`\n✅ カウンセラー音声AIエージェント起動中`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '設定済み ✓' : '未設定 ✗'}`);
  console.log(`   Realtime model: ${model}`);
  console.log(`\n   Ctrl+C で停止\n`);
});
