import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // 💡 Supabaseから、すべての予約データを「予約日が新しい順（または受付順）」で持ってくる
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("*")
      .order("booking_date", { ascending: false }) // 日付が新しい順
      .order("start_time", { ascending: false });  // 時間が遅い順

    if (error) throw error;

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("管理画面データの取得エラー:", error);
    return NextResponse.json({ error: "データの取得に失敗しました" }, { status: 500 });
  }
}