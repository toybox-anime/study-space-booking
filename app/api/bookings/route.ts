import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabaseの準備
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: Request) {
  // 💡 URLから「調べたい日付（?date=202X-XX-XX）」を受け取る
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "日付が指定されていません" }, { status: 400 });
  }

  try {
    // 💡 Supabaseのbookingsテーブルから、その日の予約データを全部持ってくる！
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("start_time, hours")
      .eq("booking_date", date);

    if (error) throw error;

    // 💡 持ってきたデータから、「すでに埋まっている時間」のリストを作る
    // （例：「14:00から2時間」という予約があれば、["14:00", "15:00"] をリストに入れる）
    const bookedHours: string[] = [];
    
    bookings.forEach((booking) => {
      // "14:00" の "14" の部分だけを数字にする
      const startHour = parseInt(booking.start_time.split(":")[0]);
      
      // 予約されている時間帯（時間数分）をループしてリストに追加
      for (let i = 0; i < booking.hours; i++) {
        bookedHours.push(`${startHour + i}:00`);
      }
    });

    // 予約済みの時間のリストを画面（フロント）に返す
    return NextResponse.json({ bookedHours });

  } catch (error) {
    console.error("予約状況の取得エラー:", error);
    return NextResponse.json({ error: "予約状況の取得に失敗しました" }, { status: 500 });
  }
}