"use client";

import { useState } from "react";

export default function Home() {
  // 💡 ① お客さんが選ぶデータを保存しておく箱（State）
  const [date, setDate] = useState(""); // 予約日 (例: 2026-03-04)
  const [startTime, setStartTime] = useState("10:00"); // 開始時間 (例: 10:00)
  const [hours, setHours] = useState(2); // 利用時間 (例: 2)
  const [isLoading, setIsLoading] = useState(false);

  // 💡 ② 金額の自動計算（1時間 = 500円 とする）
  const unitPrice = 500;
  const totalPrice = hours * unitPrice;

  // 💡 ③ 決済ボタンを押した時の処理
  const handleCheckout = async () => {
    // もし日付が選ばれていなかったらエラーを出す
    if (!date) {
      alert("利用日を選択してください！");
      return;
    }

    setIsLoading(true);

    try {
      // 💡 変更点！：APIを叩くときに、お客さんが選んだ「予約データ」も一緒に送る
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: date,
          startTime: startTime,
          hours: hours,
          totalPrice: totalPrice, // 今回は合計金額もAPIに教えてあげる
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("決済画面への移動に失敗しました");
        setIsLoading(false);
      }
    } catch (error) {
      alert("エラーが発生しました");
      setIsLoading(false);
    }
  };

  // 画面の見た目
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm w-full">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          My Study Space
        </h1>
        <p className="text-slate-500 mb-8">ドロップイン予約</p>

        {/* 📅 日付を選ぶフォーム */}
        <div className="mb-4 text-left">
          <label className="block text-sm font-bold text-slate-700 mb-1">
            利用日
          </label>
          <input
            type="date"
            className="w-full border border-slate-300 rounded-lg p-3 text-slate-700"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* ⏰ 時間を選ぶフォーム（横並び） */}
        <div className="flex gap-2 mb-8 text-left">
          <div className="flex-1">
            <label className="block text-sm font-bold text-slate-700 mb-1">
              開始時間
            </label>
            <select
              className="w-full border border-slate-300 rounded-lg p-3 text-slate-700"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            >
              {/* 簡単のために10時から20時の選択肢を作る */}
              {[...Array(11)].map((_, i) => (
                <option key={i} value={`${10 + i}:00`}>{`${10 + i}:00`}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-bold text-slate-700 mb-1">
              利用時間
            </label>
            <select
              className="w-full border border-slate-300 rounded-lg p-3 text-slate-700"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6].map((h) => (
                <option key={h} value={h}>
                  {h}時間
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 💰 自動計算された合計金額の表示 */}
        <div className="mb-8">
          <p className="text-sm font-bold text-slate-500">合計金額 (税込)</p>
          <div className="text-4xl font-black text-blue-600">
            ¥{totalPrice.toLocaleString()}
          </div>
        </div>

        {/* 決済ボタン */}
        <button
          onClick={handleCheckout}
          disabled={isLoading}
          className={`w-full text-white font-bold py-4 rounded-xl text-lg transition shadow-md ${
            isLoading
              ? "bg-slate-400 cursor-not-allowed"
              : "bg-slate-800 hover:bg-slate-700"
          }`}
        >
          {isLoading ? "準備中..." : "カードで決済して予約"}
        </button>
      </div>
    </div>
  );
}
