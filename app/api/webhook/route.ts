import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
const resend = new Resend(process.env.RESEND_API_KEY as string);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

// 💡 【大追加】現実のスマートロックAPIと通信するための専用関数（今回はダミー）
async function createSmartLockPin(date: string, startTime: string, hours: string) {
  console.log("🔒 スマートロックAPIに接続中...");

  // 1. 予約の「開始日時」と「終了日時」を正確に計算する
  const startDateTime = new Date(`${date}T${startTime}:00+09:00`);
  const endDateTime = new Date(startDateTime.getTime() + parseInt(hours) * 60 * 60 * 1000);

  // 💡 もし本当にRemoteLockを契約していたら、ここで以下のような通信を行います
  /*
  const response = await fetch("https://api.remotelock.com/v1/access_persons", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.REMOTELOCK_API_KEY}`, // 秘密のAPIキー
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      type: "access_guest",
      attributes: {
        name: "Drop-in Guest",
        pin: Math.floor(1000 + Math.random() * 9000).toString(), // 作ってほしい暗証番号
        starts_at: startDateTime.toISOString(), // 例: "2024-03-05T01:00:00.000Z"
        ends_at: endDateTime.toISOString()      // 例: "2024-03-05T03:00:00.000Z"
      }
    })
  });
  const result = await response.json();
  return result.pin; // APIから発行された本物の暗証番号を返す
  */

  // 今回はダミーとして、ここでランダムな4桁を生成して返します
  // （※2秒待たせて、本当に通信しているような「タメ」を作ります笑）
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const dummyPin = Math.floor(1000 + Math.random() * 9000).toString();
  
  console.log(`🔓 ドアシステムから暗証番号 [${dummyPin}] が発行されました！`);
  return dummyPin;
}

export async function POST(req: Request) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature") as string;
  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const bookingDate = session.metadata?.bookingDate;
    const bookingStartTime = session.metadata?.bookingStartTime;
    const bookingHours = session.metadata?.bookingHours;

    if (!bookingDate || !bookingStartTime || !bookingHours) {
      console.error("⚠️ メタデータが不足しています");
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    try {
      // 💡 ① 【ここで呼び出す！】適当な暗証番号ではなく、スマートロック連携関数を使ってPINを取得する
      const pinCode = await createSmartLockPin(bookingDate, bookingStartTime, bookingHours);

      // 💾 ② 取得した「本物の暗証番号」をSupabaseに保存する
      const { error: dbError } = await supabase.from("bookings").insert([
        {
          booking_date: bookingDate,
          start_time: bookingStartTime,
          hours: parseInt(bookingHours),
          pin_code: pinCode,
          stripe_session_id: session.id,
        },
      ]);

      if (dbError) throw dbError;
      console.log("💾 データベースに予約と暗証番号を記録しました！");

      // 📧 ③ お客さんにメールで暗証番号を伝える
      await resend.emails.send({
        from: "My Study Space <onboarding@resend.dev>",
        to: process.env.MY_TEST_EMAIL as string,
        subject: "【My Study Space】ご予約完了と入館用暗証番号のお知らせ",
        html: `
          <div style="font-family: sans-serif; color: #333;">
            <h2>ご予約ありがとうございます！</h2>
            <p><strong>📅 ご利用日:</strong> ${bookingDate}</p>
            <p><strong>⏰ 開始時間:</strong> ${bookingStartTime}</p>
            <p><strong>⏳ ご利用時間:</strong> ${bookingHours} 時間</p>
            <hr />
            <h3 style="color: #0369a1;">🔑 入館用・暗証番号: <span style="font-size: 32px;">${pinCode}</span></h3>
            <p style="font-size: 12px; color: #666;">※ドアのパネルでこの番号を押してご入館ください。</p>
            <p style="font-size: 12px; color: #666;">※この番号は、ご予約時間のみ有効なシステム連動キーです。</p>
          </div>
        `,
      });
      console.log("📩 予約完了メールを送信しました！");
    } catch (error) {
      console.error("⚠️ エラー発生:", error);
    }
  }

  return NextResponse.json({ received: true });
}