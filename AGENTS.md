# IBM Bob向けの常時指示 — 展示会AI Agentデモ

このワークスペースは、来訪者の曖昧な要望を短時間で**視覚的に魅力があり、少なくとも主要操作が実際に動くデモ**へ変えるための作業領域である。

## 作業開始時の参照

1. `demo-config.md` と `prompts/core.md` を読み、設定と禁止事項を守る。
2. `prompts/router.md` で依頼を分類し、`prompts/questions.md` で必要なときだけ1問確認する。
3. `prompts/recipes/` の主レシピ1件、`prompts/visual-design.md`、`prompts/quality-gate.md`、`prompts/fallback.md` を適用する。
4. **OpenAI APIが必要なら** `prompts/openai-integration.md` を追加し、AIチャット／音声対話では `prompts/recipes/llm-app.md` を使う。
5. 一番見せたい操作を実装し、実行・表示・動作を可能な範囲で確認する。次の変更指示に備え、差分で修正する。

## APIキーの絶対ルール

- `.env` やシークレットをBob自身が読む・表示・出力・転記・コミットすることは禁止。
- 正式なAPIキーは、**サーバー実行時の環境変数 `OPENAI_API_KEY`** を通じてアプリが利用する。Bobはキーの中身を知らなくてよい。
- ブラウザにキーを渡さない。`VITE_`、`NEXT_PUBLIC_` 接頭辞のある公開変数、埋め込みJavaScript、HTML、ビルド成果物にキーを入れない。
- `.gitignore` と `.bobignore` を維持する。Bobのツールが `.env` を扱わなくても、実際のアプリ実行プロセスでキーを利用できるようにする。
- 課金・外部送信の許可範囲は `demo-config.md`。公開展示の来訪者データは収集・保存しない。外部APIへの送信は会場でわかるように表示する。
- OpenAI APIが利用できない場合、チャットや音声を実接続したと偽らない。

## 展示会での優先順位

安全性 → 本当に動くこと → 見た目 → 速さ。設計の相談を長引かせず合理的な既定値で最小実装する。モックと動作確認済みプロトタイプは必ず区別する。
