"use client";

import { useEffect, useState } from "react";

// データベースから取得する予約データの「型（形）」を定義
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

  // 画面が開いたときに、裏側のAPI（これから作ります）を叩いて予約一覧をもらってくる
  useEffect(() => {
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

    fetchBookings();
  }, []);

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
                  <th className="p-4 font-bold text-slate-600">受付日時</th>
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
                    <td className="p-4 text-sm text-slate-400">
                      {new Date(booking.created_at).toLocaleString("ja-JP")}
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