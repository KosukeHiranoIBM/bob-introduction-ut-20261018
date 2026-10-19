# OpenAI API連携 — IBM Bob 展示会デモの実装ルール

> このMarkdownは**APIキーそのものを格納するファイルではない**。プロジェクト直下の `.env` は運営者が手動で用意し、アプリの**サーバー実行環境**だけから参照する。

## 0. 使用許可と分岐

- `demo-config.md` により、**OpenAI APIへのデモ用途の通信は事前に許可されている**。ただし、入力がOpenAIへ送られることを来訪者に掲示し、個人情報、機密情報、実業務データを送らない。
- 単純な家計簿、2人用囲碁、TODOなど、**LLM不要ならAPIを呼ばない**。
- テキスト対話、自然言語による文章生成、AI相談など：サーバー経由の **Responses API**。
- **音声を聞いて音声で即時返答する**依頼：ブラウザ **Realtime API + WebRTC** と**サーバー発行の短期クライアントシークレット**を優先する。テキストチャットと混同しない。

## 1. 認証情報を守るための制約

1. キーは `.env` にのみ保管（または運営者管理の秘密変数）。`.env.example` に本物のキーを入れない。
2. `.env` は `.gitignore`、`.bobignore` に記載する。`AGENTS.md` にもBobへの閲覧禁止を明記。
3. **Bobは秘密ファイルの中身を読むことも、コマンドで表示することも、ログへ写すことも禁止。** Bobが必要とするのは変数名と読み込み方だけ。
4. **React/Vite/Next.jsクライアント側コードから `OPENAI_API_KEY` を参照しない。** `dangerouslyAllowBrowser: true` を設定しない。
5. サーバーの `process.env.OPENAI_API_KEY` をOpenAI SDKへ渡す。SDK既定の環境変数名は `OPENAI_API_KEY`。
6. 実行時に `.env` が読まれていない場合は、**キーの存在のみ（真偽値）を運営者側で診断する**。値や先頭・末尾の数文字も表示しない。
7. エラーログ・HTTP応答・画面にシークレット、Bearerヘッダー、内部プロンプト、スタックトレースを出さない。
8. 鍵を安全に保管しても、生成した不審なコードによる読み取り・送信を防げるとは限らない。不要なファイルシステム権限、ネットワーク宛先、シェル実行を制限し、運営者がレビューする。

## 2. ローカル `.env` の設定例

`.env.example` を `.env` にコピーし、**運営者が手動で** `OPENAI_API_KEY` を設定する（このリポジトリには `.env` を含めない）。

```dotenv
OPENAI_API_KEY=ここに運営者が本物のキーを設定
OPENAI_MODEL=gpt-5.6-terra
OPENAI_REALTIME_MODEL=gpt-realtime-2.1-mini
```

**注意**：`.env` は置くだけであらゆるNode.jsアプリに自動読込されるわけではない。**アプリのサーバー起動方法に従って**読み込む（Next.jsのサーバー環境、`dotenv`、対応Node.jsの `--env-file=.env` など）。`echo $OPENAI_API_KEY` のような表示はしない。

## 3. テキストチャット — Node.js サーバー側の呼び出し

依頼に応じたバックエンドAPI（例：`POST /api/chat`）を既存のサーバーに追加し、フロントエンドからは**質問テキストのみ**を送信する。LLMの返答のみを受け取る。

```javascript
// サーバー専用。ブラウザにバンドルしない。
import OpenAI from 'openai';

const openai = new OpenAI(); // process.env.OPENAI_API_KEY を自動参照

export async function answerVisitor(message) {
  const model = process.env.OPENAI_MODEL || 'gpt-5.6-terra';
  const response = await openai.responses.create({
    model,
    instructions: '日本語で簡潔に答える展示会用AIです。個人情報を尋ねないでください。',
    input: message,
    max_output_tokens: 250,
  });
  return response.output_text;
}
```

上記は**サーバー側関数の参考例**であり、HTTPルート、環境変数読込、入力検証、エラー処理は使用中のサーバーに合わせて実装すること。実API応答を未確認のまま完成扱いしない。入力長・履歴長・レートを制限する。キーボード入力は送信操作で応答し、処理中インジケータと通信エラー表示を設ける。

## 4. 音声会話 — Realtime APIの構成

リアルタイムおしゃべり（マイク入力と音声返答）を要求されたら、以下の実構成にする。

```text
[ブラウザ: マイク / 発話ボタン]
    │ 1. /api/realtime-session へ開始要求
    ▼
[自社サーバー: OPENAI_API_KEY を保持]
    │ 2. OpenAIへ短命のクライアントシークレットを要求
    ▼
[ブラウザ: 受け取った短期シークレットでWebRTC接続]
    │ 3. 双方向の音声をやり取り（長期APIキーはブラウザに渡さない）
    ▼
[OpenAI Realtime API]
```

- 実装前に公式ガイドで最新のエンドポイント・セッション形状・対応モデルを確認する。
- WebRTC / RealtimeSession を使い、OpenAIサーバーから取得した**短期クライアントシークレットのみ**をクライアントへ渡す。
- マイク利用はユーザー操作とブラウザの権限許可後だけにする。HTTPSまたはlocalhostなどブラウザ要件を満たす。
- 音声停止・切断ボタンを設置し、次の来訪者へ会話を引き継がない。
- 音が出ない環境でも状態を表示し、接続エラー時に録音済み音声をあたかも実時間応答のように再生しない。
- ネットワークが遅い場合は、**音声機能未実装を明示したテキストチャットの実動作版**へスコープ変更してもよい。

## 5. デモ運用の制限

- メッセージと会話履歴の文字数、応答トークン数、同時セッション数、連続リクエスト頻度に上限を置く。
- 来訪者が入力した個人情報を保存・外部送信しない運営ルールを周知する。画面に短い注意文を表示する。
- 429、401、ネットワーク不通時は**通信できないことを明示**する。ダミーの応答をAPI成功と表示しない。
- OpenAIのプロジェクト別利用額・アラート・必要ならハード上限を設定する。予算に余裕があっても、誤動作での連続課金は防ぐ。
- 本番前に**秘密がフロントエンドのビルド成果物／ネットワークレスポンスに含まれないこと**を確認する。実キーはテスト出力に書かない。

## 6. 合格条件

**テキストチャット**：入力→自サーバーのAPI→OpenAI応答→画面反映が実際に通り、キーは開発者ツールやクライアントコードから取得できない。

**音声会話**：マイク許可→短期シークレット発行→Realtime接続→音声入力と実際の音声返答→明示的終了が成功する。

**実装不能**：無理に偽装せず「API接続設定が必要」「マイク許可待ち」「接続できません」などの状態を表示する。

## 公式資料（実装時に最新版を参照）

- IBM Bob のファイルアクセス保護： https://bob.ibm.com/docs/ide/security/bob-security-guidance
- OpenAI APIの秘密管理： https://developers.openai.com/api/reference/overview
- OpenAI SDK認証： https://github.com/openai/openai-node/blob/main/docs/authentication.md
- OpenAI Realtime： https://developers.openai.com/api/docs/guides/realtime
- OpenAI WebRTC： https://developers.openai.com/api/docs/guides/voice-webrtc
