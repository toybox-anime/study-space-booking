"use client";

import { useEffect, useState } from "react";

type Booking = {
  id: string;
  created_at: string;
  booking_date: string;
  start_time: string;
  hours: number;
  pin_code: string;
};

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  // 予約データを取得する関数（再利用できるように外に出しました）
  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/admin/bookings");
      const data = await res.json();
      if (data.bookings) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error("予約データの取得に失敗しました", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 💡 追加：キャンセルボタンを押したときの処理
  const handleDelete = async (id: string, date: string, time: string) => {
    // 間違えて押さないように確認メッセージを出す
    const isConfirmed = window.confirm(`${date} ${time} からの予約をキャンセル（削除）しますか？\n※この操作は元に戻せません。`);
    
    if (!isConfirmed) return;

    try {
      // 先ほど作った削除APIを呼び出す
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("予約をキャンセルしました。");
        // 削除が終わったら、もう一度最新のリストを読み込み直す
        fetchBookings();
      } else {
        alert("削除に失敗しました。");
      }
    } catch (error) {
      alert("エラーが発生しました。");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">🛠️ 店長ダッシュボード (予約一覧)</h1>

        {isLoading ? (
          <p className="text-slate-500">データを読み込み中...</p>
        ) : bookings.length === 0 ? (
          <p className="text-slate-500">まだ予約はありません。</p>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 font-bold text-slate-600">予約日</th>
                  <th className="p-4 font-bold text-slate-600">時間</th>
                  <th className="p-4 font-bold text-slate-600">暗証番号</th>
                  <th className="p-4 font-bold text-slate-600 text-center">操作</th> {/* 💡 追加 */}
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="p-4 font-bold text-slate-800">{booking.booking_date}</td>
                    <td className="p-4 text-slate-700">
                      {booking.start_time} から {booking.hours}時間
                    </td>
                    <td className="p-4">
                      <span className="bg-sky-100 text-sky-700 font-bold px-3 py-1 rounded-lg tracking-wider">
                        {booking.pin_code}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleDelete(booking.id, booking.booking_date, booking.start_time)}
                        className="bg-red-100 text-red-600 hover:bg-red-200 px-4 py-2 rounded-lg text-sm font-bold transition"
                      >
                        キャンセル
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}