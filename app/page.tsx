"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [hours, setHours] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  
  // 💡 追加：APIから受け取った「予約済みの時間」を保存しておく箱
  const [bookedHours, setBookedHours] = useState<string[]>([]);

  const unitPrice = 500;
  const totalPrice = hours * unitPrice;

  // 💡 追加：今日の日付を「YYYY-MM-DD」の形式で取得する（例: "2024-03-05"）
  const today = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).split('/').join('-');

  // 💡 追加：営業時間を設定（例：朝9時から夜22時まで）
  const OPEN_HOUR = 9;  // 9時オープン
  const CLOSE_HOUR = 22; // 22時クローズ
  
  // 営業時間の選択肢のリストを自動で作る
  const availableTimes = [];
  for (let h = OPEN_HOUR; h <= CLOSE_HOUR; h++) {
    availableTimes.push(`${h}:00`);
  }

  // 💡 【大追加！】日付（date）が選ばれたら自動的にAPIを叩いて予約状況をチェックする！
  useEffect(() => {
    if (!date) return;

    const fetchBookings = async () => {
      try {
        // 先ほど作ったAPIに「この日の予約状況を教えて！」と通信する
        const res = await fetch(`/api/bookings?date=${date}`);
        const data = await res.json();
        
        if (data.bookedHours) {
          setBookedHours(data.bookedHours); // 結果を保存する
        }
      } catch (error) {
        console.error("予約状況の取得に失敗しました");
      }
    };

    fetchBookings();
  }, [date]); // ← dateの中身が変わるたびに、この中身が自動で動く（超重要！）

  const handleCheckout = async () => {
    if (!date) {
      alert("利用日を選択してください！");
      return;
    }

    // 💡 念のため、選んだ時間がすでに予約済みじゃないかチェックする
    if (bookedHours.includes(startTime)) {
      alert("申し訳ありません、その時間はすでに予約が埋まっています。");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/checkout", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: date,
          startTime: startTime,
          hours: hours,
          totalPrice: totalPrice,
        })
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm w-full">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">My Study Space</h1>
        <p className="text-slate-500 mb-8">ドロップイン予約</p>
        
        <div className="mb-4 text-left">
          <label className="block text-sm font-bold text-slate-700 mb-1">利用日</label>
          <input 
            type="date" 
            className="w-full border border-slate-300 rounded-lg p-3 text-slate-700"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={today} // 💡 今日以降の日付しか選べないようにする
          />
        </div>

        <div className="flex gap-2 mb-8 text-left">
          <div className="flex-1">
            <label className="block text-sm font-bold text-slate-700 mb-1">開始時間</label>
            <select 
              className="w-full border border-slate-300 rounded-lg p-3 text-slate-700"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            >
              {/* 💡 先ほど作った availableTimes を使って選択肢を表示する */}
              {availableTimes.map((timeStr) => {
                const isBooked = bookedHours.includes(timeStr);
                return (
                  <option key={timeStr} value={timeStr} disabled={isBooked}>
                    {timeStr} {isBooked ? "(予約済)" : ""}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-bold text-slate-700 mb-1">利用時間</label>
            <select 
              className="w-full border border-slate-300 rounded-lg p-3 text-slate-700"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6].map((h) => (
                <option key={h} value={h}>{h}時間</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-sm font-bold text-slate-500">合計金額 (税込)</p>
          <div className="text-4xl font-black text-blue-600">
            ¥{totalPrice.toLocaleString()}
          </div>
        </div>

        <button
          onClick={handleCheckout}
          disabled={isLoading}
          className={`w-full text-white font-bold py-4 rounded-xl text-lg transition shadow-md ${
            isLoading ? "bg-slate-400 cursor-not-allowed" : "bg-slate-800 hover:bg-slate-700"
          }`}
        >
          {isLoading ? "準備中..." : "カードで決済して予約"}
        </button>
      </div>
    </div>
  );
}