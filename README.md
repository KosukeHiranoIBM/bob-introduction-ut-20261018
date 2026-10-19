# 🚀 IBM Bob 展示会デモキット & アプリ集

IBM Bobを使って自然言語から生成されたデモアプリケーション集および展示会用プロンプトキットです。

---

## 🎮 作成済みデモアプリ一覧（ブラウザですぐ開けます）

GitHub Pagesを有効化すると、ブラウザ上で直接動作させることができます：

| デモアプリ | 概要 | ファイル / リンク |
|---|---|---|
| 🌐 **ポータル & ガイド** | 展示会用ショーケース & デモポータル | [`index.html`](./index.html) |
| 🎮 **東京マリオゲーム** | 東京の名所を巡る2D横スクロールアクション | [`tokyo-mario-game/index.html`](./tokyo-mario-game/index.html) |
| 💡 **AI理解度クイズ** | AIの基礎知識を学べる4択クイズ | [`ai-quiz/index.html`](./ai-quiz/index.html) |
| 🧪 **サイエンスクイズ** | 科学と宇宙のトリビアクイズ | [`science-quiz/index.html`](./science-quiz/index.html) |
| ✈️ **韓国旅行クイズ** | 韓国カルチャー＆旅行クイズ | [`korea-travel-quiz/index.html`](./korea-travel-quiz/index.html) |
| 🗣️ **若者言葉変換器** | 文章を最新の若者言葉/Z世代用語に翻訳 | [`wakamono-converter/index.html`](./wakamono-converter/index.html) |
| 🎙️ **カウンセラー音声AI** | OpenAI Realtime API連携の音声対話エージェント | [`counselor-voice-agent/`](./counselor-voice-agent/README.md) *(Node.js)* |

---

## 🚀 デモアプリの起動・閲覧方法

### 1. 静的Webアプリ（ゲーム・クイズ・変換器）
特別なサーバーは不要です。ブラウザで各 `index.html` をダブルクリックして開くか、VSCode等の Live Server またはローカルHTTPサーバーで閲覧できます。

### 2. 音声対話AIエージェント (`counselor-voice-agent`)
Node.jsとOpenAI APIキーが必要です：
```bash
# 1. テンプレートから.envを作成（APIキーを設定）
cp .env.example .env
# .env を編集して OPENAI_API_KEY=sk-... を設定

# 2. 依存関係のインストールと起動
cd counselor-voice-agent
npm install
npm start
```
ブラウザで `http://localhost:3000` を開きます。

---

## 📁 フォルダ構成

```text
├── index.html                      # 🚀 展示会用ポータル & ガイド
├── WHAT-BOB-CAN-DO.md             # 📖 展示会ブース用：Bobでできることガイド
├── showcase.html                   # ✨ 展示会用インタラクティブWebガイド
├── README.md                       # このファイル
├── START-HERE.md                  # Agentの最初の指示として使う文章
├── AGENTS.md                      # IBM Bobが自動で読み込むプロジェクト指示
├── .gitignore / .bobignore        # 秘密情報の除外（.env 等）
├── .env.example                    # API設定用の雛形
├── demo-config.md                  # 会場・実行環境に合わせて最初に編集
├── ai-quiz/                        # AIクイズアプリ
├── counselor-voice-agent/          # カウンセラー音声AI（Node.js + OpenAI）
├── korea-travel-quiz/              # 韓国旅行クイズ
├── science-quiz/                   # サイエンスクイズ
├── tokyo-mario-game/               # 東京マリオゲーム
├── wakamono-converter/             # 若者言葉変換器
├── prompts/
│   ├── core.md                     # 最上位の行動原則と出力要件
│   ├── router.md                   # 意図整理・実装経路・レシピ選択
│   ├── openai-integration.md       # OpenAI APIと.envの安全な接続ルール
│   ├── questions.md                # 0〜1問の質問判断
│   ├── visual-design.md            # 見た目・表示方法・アクセシビリティ
│   ├── quality-gate.md             # 最低限の機能とテスト
│   ├── fallback.md                 # 複雑／未知／実行不可の依頼
│   └── recipes/
│       ├── game.md                 # ボードゲーム・パズルなど
│       ├── dashboard.md            # 家計簿・分析・集計・グラフなど
│       ├── management.md           # TODO・顧客・在庫・予定など
│       ├── generator.md            # クイズ・献立・文面・アイデアなど
│       ├── workflow.md             # 手順・自動化・承認フローなど
│       └── llm-app.md              # テキストチャット・音声リアルタイム対話
├── examples/
│   ├── go.md                       # 「囲碁を作って」の具体化例
│   └── household-budget.md         # 「家計簿を作って」の具体化例
└── tests/
    └── acceptance-cases.md         # 展示会の事前テスト集
```

## 最初に決めること

1. `demo-config.md` を編集して、利用可能なツール・フレームワーク・プレビュー方法・ブランドを記入する。未定なら既定値のまま試す。
2. `START-HERE.md` の起動指示を Agent に渡し、`core.md` を基本指示として読み込ませる。`router.md`、`questions.md`、`visual-design.md`、`quality-gate.md`、`fallback.md` も共通指示にする。
3. `router.md` の判定に応じて、`recipes/` の **1ファイルだけ**を追加で読み込む。専門知識が必要な場合のみ `examples/` を参考資料にする。
4. 来訪者の発言を渡す。Agent が質問する場合は **最大1問**。回答なしなら安全な既定値で続ける。
5. Agent がツールを使ってファイル生成／起動／動作確認できたらプレビューを表示する。実行できないときは、その事実を明記する。
6. 「もう一つ変更できます」と伝え、来訪者の追加指示を反映する。

> **重要：** Markdown は設計ルールです。Markdown ファイルを置くだけで自動的にコードが動くわけではありません。**ファイル操作・実行環境・プレビュー表示**が可能な Agent / ツールが別途必要です。利用可能でないツールを使ったふりはしません。

## 推奨する組み込み方

### A. ファイル読み込み可能なコーディング Agent

`core.md` を主指示にして、依頼が届いたときに `router.md` を読み、対応レシピを参照させます。**IBM Bobではルート `AGENTS.md` が自動読込対象なので、これを起点にします。**利用可能なファイル・シェル・ブラウザ・プレビューの操作をツールとして与えてください。

### B. アプリから LLM を呼び出す方式

1. 入力を `router.md` により **構造化**（`router.md` の JSON 仕様参照）。
2. 解析結果と該当レシピ、共通指示を「実装 Agent」に渡す。
3. 実装結果を一時的な隔離環境でプレビューし、`quality-gate.md` で検査。
4. 修正指示では、直前の成果物／ファイル状態と変更点だけを渡して再実行。

意図分類を独立ステップにするなら、`router.md` の JSON をプログラム側で検証してください。AI が返す `recipe_file` のパスを無条件にファイル読込へ使わず、**許可リスト**から対応ファイルを選択してください。

## 実行時に渡す入力例

```yaml
visitor_request: "家計簿を作って"
locale: "ja-JP"
demo_mode: true
available_tools: ["file_write", "shell", "preview", "screenshot"]
tech_stack: "existing React + TypeScript app; avoid uninstalled libraries"
workspace: "isolated disposable sandbox"
allowed_external_services: ["OpenAI API (only when needs_llm=true)"]
preview_command: "[運営側で実際のコマンドを設定]"
test_command: "[運営側で実際のコマンドを設定]"
brand_name: "[任意]"
```

この例は設定フォーマットの提案であり、特定の Agent SDK に依存する仕様ではありません。

## デモの「完成」の定義

- 作品の主役が**最初の画面で理解**できる。
- **最低1つの主要操作が実際に動く**。静的デザインなら「画面案」と明示する。
- サンプルデータを実データと誤認させない。
- 生成・実行・確認の成否を正直に表示する。
- 追加指示に応じ、**前の成果を維持したまま**変化できる。

時間の目安（最初の反応 3〜5 秒、試作品 20〜40 秒、全体 60〜90 秒）は**設計目標**であり、どのモデル／ツールでも保証される性能ではありません。実測して調整してください。

## 安全上の前提

来訪者には実名・住所・取引先情報・社内機密を入力しないよう掲示し、入力例には架空データを使います。生成コードは隔離環境でのみ実行し、外部送信・課金・データ削除などは事前許可なく行いません。未知の依存パッケージを勝手にインストールしないでください。

## まず試す2題

- `examples/go.md`：囲碁は「2人対戦の9路盤」にスコープを絞って成立させる。
- `examples/household-budget.md`：家計簿は「追加 → 集計更新 → グラフ反映」を成立させる。

最後に `tests/acceptance-cases.md` で、本当に動いたか・操作できたか・誤解を招かないかをチェックしてください。

## IBM Bob + OpenAI API の使い方（本キット追加分）

このフォルダ全体を **IBM Bob のワークスペース直下**に置いて `Agent` モードで使用する。`AGENTS.md` が読み込まれ、依頼に応じてレシピやOpenAI連携ルールを参照する。Bobの実行・編集権限は事前に確認する。

1. **`.env.example` をコピーし、実際の `.env` を運営者がローカルで作成**。`OPENAI_API_KEY` に本物のキーを入力。Bobの会話欄には貼らない。
2. **`.env` をBobに読ませない**。`.bobignore` と `.gitignore` を維持。両者は秘密漏えい対策の一部であり、実行権限管理の代わりにはならない。
3. Bobに「文字でAIと会話するアプリを作って」と依頼し、**実行サーバーに環境変数を読み込ませる**方式で実装する。キーの中身をBob自身が知る必要はない。
4. 実際のOpenAI API返信が画面に出ることを検証。音声希望なら `recipes/llm-app.md` のRealtime要件を追加。
5. 来訪者の入れ替わり時に会話履歴と音声セッションを消去。

**`.env` に実キーを書くだけではAPI呼び出しは成立しない。** Node.js等のサーバー側処理・APIルート・正しい起動設定が必要。Reactのフロントエンドへキーを渡す実装は禁止。技術詳細は `prompts/openai-integration.md`。
