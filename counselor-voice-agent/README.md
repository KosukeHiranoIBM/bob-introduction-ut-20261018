# カウンセラー音声AIエージェント

OpenAI Realtime APIを使ったカウンセラーAIと日本語で音声対話できる展示会デモアプリです。

## 構成

```
counselor-voice-agent/
├── server.js        ← Node.js + Express サーバー（APIキーはここだけ）
├── public/
│   └── index.html  ← フロントエンド（WebRTC / Realtime API）
├── package.json
└── README.md
```

## セットアップ

### 1. APIキーを設定（運営者のみ）

プロジェクト直下（`agent-demo-prompts/.env`）にAPIキーが設定されていることを確認してください。

```
OPENAI_API_KEY=sk-...（運営者が手動で設定）
OPENAI_REALTIME_MODEL=gpt-4o-realtime-preview-2024-12-17
```

### 2. 依存パッケージをインストール

```bash
cd agent-demo-prompts/counselor-voice-agent
npm install
```

### 3. 起動

```bash
npm start
# または開発時は
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

## 使い方

1. **「話しかける」ボタンをタップ** → マイク許可ダイアログが表示されます
2. ブラウザのマイク使用を**許可**してください
3. サーバーが短期シークレットを発行してOpenAIに接続します
4. AIカウンセラーが最初に話しかけてきます。自由に話しかけてください
5. 会話が終わったら「会話を終了する」、次の方へは「リセット」ボタン

## 注意事項

- **HTTPS または localhost** でのみマイクが使えます（ブラウザセキュリティ要件）
- APIキーはブラウザに渡しません。サーバー側の `process.env.OPENAI_API_KEY` だけが参照します
- 来訪者の音声はOpenAI APIへ送信されます。個人情報を入力しないよう画面に案内しています
- 会話内容はサーバーに保存しません（メモリ内のみ）

## 技術仕様

| 項目 | 内容 |
|---|---|
| バックエンド | Node.js + Express |
| 短期シークレット | `POST /api/realtime-session` でサーバー発行 |
| 音声接続 | WebRTC（SDP offer/answer） |
| AIモデル | `gpt-4o-realtime-preview-2024-12-17`（変更可） |
| 音声 | shimmer（穏やかな女性系） |
| 言語 | 日本語 |
