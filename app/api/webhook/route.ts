import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: Request) {
  const payload = await req.text();
  // Stripeから送られてきた「署名（本当にStripeからの通信かの証明書）」を取得
  const sig = req.headers.get("stripe-signature") as string;

  let event;

  try {
    // 偽造された通信でないか、秘密の鍵（whsec_...）を使って検証する！
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: any) {
    console.error("⚠️ Webhook signature verification failed.", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // 検証成功！どんなイベントが起きたかチェックする
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // 🎉 ここが完全自動化の心臓部です！ 🎉
    console.log("💰 決済が完了しました！セッションID:", session.id);
    console.log("👉 ここで RemoteLock の API を叩いて暗証番号を発行します！");
    console.log(
      "👉 発行した暗証番号を、お客さんのメールアドレスに送信します！",
    );

    // ※今回はテストなので console.log（ターミナルへの文字出力）だけ行います。
  }

  // Stripeに「無事に受け取りました！」と返事をする（これがないとStripeが何度も再送してきます）
  return NextResponse.json({ received: true });
}
