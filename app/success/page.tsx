"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react"; // 👈 これを追加！

// 💡 URLを読み取る部分を、別の部品（コンポーネント）として切り出す
function SuccessContent() {
  const searchParams = useSearchParams();
  
  const date = searchParams.get("date") || "---";
  const time = searchParams.get("time") || "---";
  const hours = searchParams.get("hours") || "0";

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
        <p className="text-4xl font-black text-sky-600 tracking-widest">1234</p>
        <p className="text-xs text-sky-600 mt-2">※予約時間の5分前から有効になります</p>
      </div>

      <Link href="/" className="inline-block w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl text-lg transition shadow-md">
        トップページへ戻る
      </Link>
    </div>
  );
}

// 💡 大元のページでは、Suspense で囲んであげる
export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-50 p-4">
      {/* URLの読み込みが終わるまでは「読み込み中...」を出して待つ */}
      <Suspense fallback={<div className="text-center p-10 font-bold text-sky-600">読み込み中...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}