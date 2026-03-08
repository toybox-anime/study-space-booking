"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  
  const date = searchParams.get("date") || "---";
  const time = searchParams.get("time") || "---";
  const hours = searchParams.get("hours") || "0";

  // 💡 ① Googleカレンダー用のURLを作るための計算処理
  let googleCalendarUrl = "";
  if (date !== "---" && time !== "---") {
    // 1. 日付のハイフンを抜く (例: 2024-03-05 -> 20240305)
    const formattedDate = date.replace(/-/g, "");
    
    // 2. 開始時間を整える (例: 9:00 -> 090000)
    const [startHour, startMinute] = time.split(":");
    const formattedStartHour = startHour.padStart(2, "0");
    const startTimeStr = `${formattedStartHour}${startMinute}00`;
    
    // 3. 終了時間を計算する (例: 9時に2時間プラス -> 110000)
    const endHourNum = parseInt(startHour) + parseInt(hours);
    const formattedEndHour = endHourNum.toString().padStart(2, "0");
    const endTimeStr = `${formattedEndHour}${startMinute}00`;

    // 4. URLのパーツを組み立てる（文字化けしないように encodeURIComponent を使う）
    const title = encodeURIComponent("【My Study Space】ドロップイン利用");
    const details = encodeURIComponent("学習スペースの予約時間です。\n入館用暗証番号はお手元のメールをご確認ください。\n※予約時間の5分前から入館可能です。");
    const location = encodeURIComponent("My Study Space 店舗");
    const dates = `${formattedDate}T${startTimeStr}/${formattedDate}T${endTimeStr}`;

    // 5. 最終的なGoogleカレンダーのリンクを完成させる（ctz=Asia/Tokyo で日本時間にする）
    googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}&ctz=Asia/Tokyo`;
  }

  return (
    <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md w-full">
      <div className="text-6xl mb-6">✅</div>
      <h1 className="text-3xl font-bold text-slate-800 mb-4">決済完了！</h1>
      
      <p className="text-slate-600 mb-8 leading-relaxed">
        ご予約ありがとうございます。<br />
        以下の内容で受け付けました。
      </p>

      <div className="bg-slate-50 p-4 rounded-xl mb-6 text-left border border-slate-100">
        <p className="text-sm text-slate-500">📅 利用日: <span className="font-bold text-slate-800">{date}</span></p>
        <p className="text-sm text-slate-500">⏰ 開始: <span className="font-bold text-slate-800">{time}</span></p>
        <p className="text-sm text-slate-500">⏳ 時間: <span className="font-bold text-slate-800">{hours} 時間</span></p>
      </div>

      <div className="bg-sky-50 p-6 rounded-2xl mb-8 border border-sky-100">
        <p className="text-sm text-sky-800 font-bold mb-2">入館用・暗証番号</p>
        <p className="text-4xl font-black text-sky-600 tracking-widest">メールをご確認ください</p>
        <p className="text-xs text-sky-600 mt-2">※予約時間の5分前から有効になります</p>
      </div>

      {/* 💡 ② Googleカレンダー追加ボタン（URLがある時だけ表示） */}
      {googleCalendarUrl && (
        <a 
          href={googleCalendarUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl mb-4 transition shadow-sm"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/></svg>
          Googleカレンダーに追加する
        </a>
      )}

      <Link href="/" className="inline-block w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl text-lg transition shadow-md">
        トップページへ戻る
      </Link>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-50 p-4">
      <Suspense fallback={<div className="text-center p-10 font-bold text-sky-600">読み込み中...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}