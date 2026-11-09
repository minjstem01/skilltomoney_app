"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Reservation {
  id: string;
  courseName: string;
  price: number;
  userName: string;
  userPhone: string;
  createdAt: string;
}

export default function AdminPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/reservations");
      const json = await res.json();
      if (json.success) {
        setReservations(json.data);
      }
    } catch (err) {
      console.error("예약 목록 조회 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`'${name}' 님의 예약을 삭제하시겠습니까?`)) return;

    try {
      const res = await fetch(`/api/reservations?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setReservations((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert(json.message || "삭제에 실패했습니다.");
      }
    } catch {
      alert("삭제 요청 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const totalRevenue = reservations.reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div className="min-h-screen bg-[#070F2B] text-white flex flex-col justify-between selection:bg-amber-500 selection:text-slate-900">
      {/* 헤더 */}
      <header className="w-full border-b border-amber-500/20 px-6 py-4 backdrop-blur-md sticky top-0 z-40 bg-[#070F2B]/90">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl sm:text-2xl font-black tracking-tight text-white hover:text-amber-300 transition-colors">
              스킬<span className="text-amber-400">투</span>머니
            </Link>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-semibold">
              관리자 모드
            </span>
          </div>

          <Link
            href="/"
            className="px-3.5 py-1.5 text-xs sm:text-sm rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 transition-colors"
          >
            ← 강좌 목록 화면으로
          </Link>
        </div>
      </header>

      {/* 메인 대시보드 */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              실시간 예약 접수 현황
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              스킬투머니 원데이 클래스 신청 고객 명단입니다.
            </p>
          </div>

          <button
            onClick={fetchReservations}
            className="px-4 py-2 rounded-xl bg-[#0F1C3F] border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold hover:border-amber-400 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>🔄</span> 새로고침
          </button>
        </div>

        {/* 요약 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="p-6 rounded-2xl bg-[#0F1C3F] border border-white/10">
            <span className="text-xs font-semibold text-slate-400">총 접수 건수</span>
            <div className="text-3xl font-extrabold text-white mt-1">
              {reservations.length} <span className="text-lg font-normal text-slate-400">건</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F1C3F] border border-amber-500/30">
            <span className="text-xs font-semibold text-amber-300">총 결제 예정 금액</span>
            <div className="text-3xl font-extrabold text-amber-400 mt-1">
              {totalRevenue.toLocaleString()} <span className="text-lg font-normal text-amber-200">원</span>
            </div>
          </div>
        </div>

        {/* 테이블 목록 */}
        <div className="rounded-2xl bg-[#0F1C3F] border border-white/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#070F2B]/60 border-b border-white/10 text-xs text-amber-300 uppercase">
                <tr>
                  <th className="px-6 py-4">예약 번호</th>
                  <th className="px-6 py-4">신청 강좌</th>
                  <th className="px-6 py-4">수강료</th>
                  <th className="px-6 py-4">예약자명</th>
                  <th className="px-6 py-4">연락처</th>
                  <th className="px-6 py-4">접수 일시</th>
                  <th className="px-6 py-4 text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400 text-sm">
                      예약 목록을 불러오는 중입니다...
                    </td>
                  </tr>
                ) : reservations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400 text-sm">
                      아직 접수된 예약이 없습니다.
                    </td>
                  </tr>
                ) : (
                  reservations.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">
                        {item.id}
                      </td>
                      <td className="px-6 py-4 font-bold text-white">
                        {item.courseName}
                      </td>
                      <td className="px-6 py-4 font-bold text-amber-400">
                        {item.price.toLocaleString()}원
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-200">
                        {item.userName}
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-mono text-xs">
                        {item.userPhone}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {item.createdAt}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDelete(item.id, item.userName)}
                          className="px-2.5 py-1 rounded-lg text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-400/30 transition-colors cursor-pointer"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="w-full border-t border-amber-500/20 px-6 py-6 text-center text-xs text-slate-400">
        <p>© 2026 스킬투머니 관리자 대시보드. All rights reserved.</p>
      </footer>
    </div>
  );
}
