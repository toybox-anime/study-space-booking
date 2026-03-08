# 🏢 My Study Space - ドロップイン予約システム

Next.js (App Router) を用いて構築された、無人店舗（学習スペース・会議室など）向けのフルスタック予約・決済システムです。
顧客の予約受付から、クレジットカード決済、スマートロック（IoT）との連携シミュレーション、自動メール送信、そして店長用の売上管理ダッシュボードまで、無人店舗運営に必要な一連の機能を網羅しています。

## ✨ 主な機能

### 👤 顧客向け機能 (フロントエンド)
* **リアルタイム空き状況確認**: データベースと連携し、予約済みの時間は選択不可（グレーアウト）になるダブルブッキング防止機能。
* **クレジットカード決済**: Stripe Checkoutを用いた安全でスムーズな決済フロー。
* **動的料金計算**: 選択した利用時間に基づく料金の自動計算。
* **カレンダー連携**: 予約完了後、ワンタップでGoogleカレンダーに予定を追加可能。

### 👑 店長向け機能 (管理画面 - `/admin`)
* **Basic認証**: ミドルウェアによるセキュアなアクセス制限。
* **ダッシュボード**: 今月の予約件数および売上見込みの自動計算・表示。
* **予約データ管理**: Supabaseから取得した予約一覧のリアルタイム表示。
* **キャンセル（削除）機能**: 誤予約などのデータ削除およびカレンダー枠の解放。

### ⚙️ バックエンド処理 (API Routes & Webhook)
* **Webhook連携**: 決済完了をトリガーにした非同期処理の実行。
* **IoT連携 (シミュレーション)**: 予約時間のみ有効な入館用暗証番号（PINコード）の自動生成。
* **自動メール配信**: Resendを利用した、予約詳細と暗証番号の自動送信。
* **データベース保存**: Supabaseを活用した安全なデータ永続化。

## 🛠️ 技術スタック

* **Framework**: [Next.js 15](https://nextjs.org/) (App Router / React)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
* **Payment**: [Stripe](https://stripe.com/jp)
* **Email**: [Resend](https://resend.com/)
* **Deployment**: [Vercel](https://vercel.com/)

## 🚀 ローカル環境での起動方法

### 1. リポジトリのクローンとパッケージのインストール
```bash
git clone https://github.com/あなたのユーザー名/study-space-booking.git
cd study-space-booking
npm install
```

### 2. 環境変数の設定
プロジェクトのルートディレクトリに `.env.local` ファイルを作成し、以下の環境変数を設定してください。

```env
# Stripe Settings
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase Settings
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhb...

# Resend Settings
RESEND_API_KEY=re_...
MY_TEST_EMAIL=your-email@example.com

# Admin Dashboard Auth
ADMIN_USER=myadmin
ADMIN_PASS=himitsu123
```

### 3. Stripe CLIの起動 (Webhookのテスト用)
別のターミナルを開き、Stripeのイベントをローカルに転送します。
```bash
stripe listen --forward-to localhost:3000/api/webhook
```
*(※起動後に表示される新しい `whsec_...` キーを `.env.local` の `STRIPE_WEBHOOK_SECRET` に設定してください)*

### 4. 開発サーバーの起動
```bash
npm run dev
```
ブラウザで `http://localhost:3000` にアクセスして動作を確認します。管理画面は `http://localhost:3000/admin` です。

## 📂 データベース(Supabase)のテーブル定義

`bookings` テーブル
```sql
create table public.bookings (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  booking_date text not null,
  start_time text not null,
  hours integer not null,
  pin_code text not null,
  stripe_session_id text not null,
  constraint bookings_pkey primary key (id)
);
```