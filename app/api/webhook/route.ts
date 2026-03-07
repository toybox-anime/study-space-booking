import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js"; // 👈 ① Supabaseを読み込む！

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
const resend = new Resend(process.env.RESEND_API_KEY as string);

// 👈 ② Supabaseの準備（URLと鍵を渡す）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

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
    const pinCode = Math.floor(1000 + Math.random() * 9000).toString();

    try {
      // 💾 ③ 【大追加！】Supabaseの「bookings」テーブルに予約データを保存する！
      const { error: dbError } = await supabase.from("bookings").insert([
        {
          booking_date: bookingDate,
          start_time: bookingStartTime,
          hours: parseInt(bookingHours || "0"),
          pin_code: pinCode,
          stripe_session_id: session.id,
        },
      ]);

      if (dbError) {
        console.error("⚠️ データベース保存エラー:", dbError);
      } else {
        console.log("💾 データベースに予約を記録しました！");
      }

      // 📧 ④ メール送信（ここは前回と同じです）
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
