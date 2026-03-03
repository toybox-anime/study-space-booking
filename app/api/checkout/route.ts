import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  try {
    // 💡 ① 画面から送られてきた「予約データ」を受け取る！
    const body = await req.json();
    const { date, startTime, hours, totalPrice } = body;

    // 💡 ② Stripeに決済画面の作成をお願いする
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "jpy",
            product_data: {
              // 商品名に、お客さんが選んだ日時を入れる！（Stripeのレシートに印字されます）
              name: `学習スペース ドロップイン (${date} ${startTime}から${hours}時間)`,
            },
            unit_amount: totalPrice, // 👈 画面で計算された金額をそのまま請求する！
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/",

      // 💡 【超重要】 ここで「予約データ」を、Stripeの決済履歴のオマケ情報（metadata）として埋め込んでおく！
      // こうすることで、決済完了のWebhookが来たときに「あ、この日時の予約だ！」と分かります。
      metadata: {
        bookingDate: date,
        bookingStartTime: startTime,
        bookingHours: hours,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "決済エラーが発生しました" },
      { status: 500 },
    );
  }
}
