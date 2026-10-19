# Router — 曖昧な依頼を用途別レシピと実装経路へ振り分ける

## 分類の目的

曖昧な自然文を、すべてに共通する厳密な仕様へ無理に変換しない。**来訪者の意図と、短いデモで成立する最小機能**を決めたら、最も近いレシピに渡す。

## レシピの選択

| category | 条件／例 | 読み込むファイル | 最初の操作例 |
|---|---|---|---|
| `game` | 囲碁、オセロ、パズル、クイズゲーム | `recipes/game.md` | 着手、移動、回答 |
| `dashboard` | 家計簿、売上分析、データ可視化 | `recipes/dashboard.md` | データを加えてグラフが更新 |
| `management` | タスク、在庫、顧客、予定の管理 | `recipes/management.md` | 新規登録、編集、完了 |
| `generator` | 献立、アイデア、クイズ、文面を生成 | `recipes/generator.md` | 条件入力 → 生成 |
| `workflow` | 自動化、承認、通知、業務手順 | `recipes/workflow.md` | 入力 → ステップ進行 |
| `llm_app` | AIチャット、リアルタイムおしゃべり、音声AI、AI相談アプリ | `recipes/llm-app.md` | 発話／テキスト入力 → AIの返答 |
| `unknown` | 該当しない／成果物が不明 | `fallback.md` | 最も近い最小の視覚化 |

**外部LLMの要否はカテゴリと独立して判定する。** `needs_llm` が真なら `prompts/openai-integration.md` も読む。たとえば「AIが献立を提案」なら `category=generator, needs_llm=true`、「AIとおしゃべり」なら `category=llm_app, needs_llm=true`。既存部品で作れる場合は、LLMが必要というだけで `concept` に落とさない。

**迷ったら主要な操作で決める。** 例：「クイズをプレイ」は `game`、「クイズ問題を作る」は `generator`。「家計簿」は入力→集計の視覚化が主役なら `dashboard`。

## 3つの実装経路

- `assemble`：既存UI部品とシンプルなロジックで成立する。**第一候補**。例：TODO、家計簿、棒グラフ。
- `codegen`：既存部品では足りず、独自のルールや状態遷移の実装が必要。例：囲碁の着手・取り判定。
- `concept`：外部データ、外部サービス、認証、本番環境、大規模AI等が不可欠で短時間に動作保証ができない。画面案＋動作可能な範囲を示し、未実装を明示。

`codegen` でも**既存プロジェクト上**に最小実装すること。いきなり全体を作り直さない。

## MVP を決めるヒューリスティック

1. まず **来訪者に1回押してもらう操作**を決める。
2. その操作による目に見える変化を1つ決める。
3. それに必要な最小のデータ・状態だけを持つ。
4. 外部連携が必要なら、明示したサンプルによるローカルデモへ縮小する。外部連携をしたとは言わない。
5. UI部品があるなら使い、なければ入手済みの標準技術で実装する。
6. 説明なしで理解できることを確認する。

## 構造化出力（プログラムから使う場合）

意図分類専用ステップでは**JSONのみ**を返す。`recipe_file` はコード側で下記の固定許可リストに対応付け、文字列のまま任意パスを開かない。

```json
{
  "goal": "家計簿を作りたい",
  "audience": "個人",
  "category": "dashboard",
  "recipe_file": "recipes/dashboard.md",
  "build_path": "assemble",
  "needs_llm": false,
  "llm_mode": "none",
  "mvp": {
    "inputs": ["金額", "カテゴリ"],
    "outputs": ["支出合計", "カテゴリ別グラフ", "履歴"],
    "primary_action": "支出を1件追加する",
    "success_check": "合計とグラフが増加する"
  },
  "assumptions": ["初期状態は架空データ", "日本円で表示"],
  "question": {
    "ask": false,
    "text": null,
    "options": [],
    "default_option": null
  },
  "scope_note": "認証と銀行連携は行わない"
}
```

スキーマの制約：

- `category`: `game | dashboard | management | generator | workflow | llm_app | unknown` のいずれか。
- `needs_llm`: boolean。外部LLMによる生成・会話・理解がMVPに必要な場合のみ `true`。
- `llm_mode`: `none | text | voice`。`needs_llm=false` なら `none`。ブラウザで音声をやり取りするリアルタイム会話は `voice`。
- `needs_llm=true` の場合、カテゴリレシピのほかに `openai-integration.md` を必ず適用。
- `build_path`: `assemble | codegen | concept` のいずれか。
- `question.ask`: 真偽値。`true` のとき `text` は1問、`options` は2〜3個、`default_option` はその1個。
- `mvp.primary_action` と `mvp.success_check`: `concept` 以外は必須。
- 取得できない情報は無理に創作しない。妥当な仮定は `assumptions` に書く。
- 出力を画面に直接見せる必要はない。利用者向けには目的と操作を短い自然文で伝える。

## 不適切な依頼／危険な操作

安全上問題がある、または無許可の外部操作が必要な場合は、ルールを優先して安全な範囲に限定する。質問1回の制約を理由に承認・認可を省略しない。

## LLM要求の判定例

| 来訪者の指示 | category | needs_llm | llm_mode | 方針 |
|---|---|---|---|---|
| AIと文字でチャットしたい | `llm_app` | true | `text` | Responses API + サーバー側プロキシ |
| リアルタイムで声でおしゃべりしたい | `llm_app` | true | `voice` | Realtime API、短期クライアントシークレット、WebRTC |
| AIに旅行プランを考えてほしい | `generator` | true | `text` | 入力フォーム + OpenAI API |
| 単純な家計簿が欲しい | `dashboard` | false | `none` | ローカルの計算・保存・可視化のみ |
| 囲碁の2人対戦が欲しい | `game` | false | `none` | ローカルゲームロジックのみ |
| 囲碁AIと対戦したい | `game` | false | `none` | まず簡易なローカル思考アルゴリズムで成立可能か判定。OpenAI APIを囲碁エンジンと誤認しない |
