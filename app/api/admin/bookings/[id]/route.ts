import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

// 💡 削除リクエスト（DELETE）を受け取る関数
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 💡 Next.js 15の仕様に合わせて params を await で解決する
  const resolvedParams = await params;
  const bookingId = resolvedParams.id;

  try {
    // Supabaseから、指定されたIDの予約データを削除する
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", bookingId);

    if (error) throw error;

    return NextResponse.json({ message: "予約をキャンセル（削除）しました" });
  } catch (error) {
    console.error("削除エラー:", error);
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }
}