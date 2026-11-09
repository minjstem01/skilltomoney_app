"use client";

import { useState } from "react";
import Link from "next/link";
import { courses as initialCourses } from "@/data/courses";

// 강좌 데이터 타입 정의
interface Course {
  id: string | number;
  name: string;
  price: number;
  seat: number; // 정원
  booked: number; // 예약 인원
  date: string; // 진행/개강 일자
  tags: string[]; // 태그 목록 (예: ["초보 환영", "2시간"])
  description?: string;
  features?: string[];
  icon?: string;
  isPopular?: boolean;
  time?: string;
  target?: string;
  materials?: string;
}

export default function Home() {
  // 강좌 목록 상태 (data/courses.js에서 불러온 데이터)
  const [courses, setCourses] = useState<Course[]>(initialCourses);

  // 예약 가능한 강좌만 보기 필터 상태
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  // 모달 상태 및 선택된 강좌
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [detailCourse, setDetailCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 예약 폼 상태
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reservationCode, setReservationCode] = useState("");

  // 필터링된 강좌 목록: 파이썬 규칙 (only_open and left == 0: continue) 적용
  const displayedCourses = courses.filter((course) => {
    const left = course.seat - course.booked;
    if (showAvailableOnly && left === 0) {
      return false;
    }
    return true;
  });

  // 예약하기 버튼 클릭 핸들러
  const handleOpenReservation = (course: Course) => {
    // 잔여 좌석이 0이면 예약 창 열리지 않음
    if (course.seat - course.booked <= 0) {
      alert("해당 강좌는 마감되었습니다.");
      return;
    }
    setSelectedCourse(course);
    setDetailCourse(null);
    setIsSubmitted(false);
    setUserName("");
    setUserPhone("");
    setReservationCode("");
    setIsModalOpen(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
    setIsSubmitted(false);
  };

  // 예약 폼 제출 핸들러 (실시간 잔여 좌석 차감)
  const handleSubmitReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userPhone.trim() || !selectedCourse) {
      alert("이름과 연락처를 모두 입력해 주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseName: selectedCourse.name,
          price: selectedCourse.price,
          userName: userName.trim(),
          userPhone: userPhone.trim(),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setCourses((prev) =>
          prev.map((c) =>
            c.id === selectedCourse.id
              ? { ...c, booked: Math.min(c.seat, c.booked + 1) }
              : c
          )
        );

        setReservationCode(`STM-${Date.now().toString().slice(-6)}`);
        setIsSubmitted(true);
      } else {
        alert(json.message || "예약에 실패했습니다.");
      }
    } catch {
      alert("서버 연결에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070F2B] text-white flex flex-col justify-between selection:bg-amber-500 selection:text-slate-900">
      {/* 1. 상단 네비게이션 헤더 */}
      <header className="w-full border-b border-amber-500/20 px-6 py-4 backdrop-blur-md sticky top-0 z-40 bg-[#070F2B]/90">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
              스킬<span className="text-amber-400">투</span>머니
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 font-semibold">
              원데이 클래스
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-xs text-slate-400 hover:text-amber-300 transition-colors hidden sm:inline-block"
            >
              예약 관리자 대시보드 ↗
            </Link>
            <div className="text-xs sm:text-sm text-slate-300">
              실시간 <span className="text-amber-400 font-bold">잔여 좌석 확인</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. 메인 컨텐츠 영역 */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-20 text-center">
        {/* 상단 소개 문구 */}
        <div className="max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-xs sm:text-sm font-semibold text-amber-300 mb-5 shadow-sm">
            <span>✨</span>
            <span>배운 기술이 돈이 되는 원데이 클래스</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight break-keep">
            스킬투머니 <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">강좌 목록</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto break-keep">
            단 하루 만에 실무 기술을 마스터하고 수익화까지 연결해 드립니다. 원하는 강좌를 선택해 예약해 보세요!
          </p>
        </div>

        {/* 3. 강좌 목록 위 필터 컨트롤 ("예약 가능한 강좌만 보기" 체크박스) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 max-w-7xl w-full mb-6 px-1">
          <div className="text-xs sm:text-sm text-slate-300 flex items-center gap-2">
            <span>
              총 <strong className="text-amber-400 font-bold">{displayedCourses.length}</strong>개의 강좌
            </span>
            {showAvailableOnly && (
              <span className="text-[11px] text-amber-300 bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 rounded-full">
                예약 가능만 표시 중
              </span>
            )}
          </div>

          <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs sm:text-sm font-medium text-slate-200 hover:text-amber-300 transition-colors p-1.5 rounded-lg hover:bg-white/5">
            <input
              type="checkbox"
              checked={showAvailableOnly}
              onChange={(e) => setShowAvailableOnly(e.target.checked)}
              className="w-4 h-4 rounded border-amber-400/50 bg-black/40 text-amber-500 focus:ring-amber-400 accent-amber-500 cursor-pointer"
            />
            <span>예약 가능한 강좌만 보기</span>
          </label>
        </div>

        {/* 4. 강좌 카드 그리드 또는 빈 화면 */}
        {displayedCourses.length === 0 ? (
          <div className="w-full max-w-md mx-auto py-16 px-4 text-center rounded-2xl bg-[#0F1C3F] border border-white/10 my-6">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-base font-bold text-white mb-1">
              현재 예약 가능한 강좌가 없습니다.
            </p>
            <p className="text-xs text-slate-400 mb-4">
              체크를 해제하면 전체 강좌 일정을 확인하실 수 있습니다.
            </p>
            <button
              onClick={() => setShowAvailableOnly(false)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30 hover:bg-amber-400/30 transition-all cursor-pointer"
            >
              전체 강좌 보기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full text-left">
            {displayedCourses.map((course) => {
              // 남은 좌석 = 정원(seat) - 예약(booked)
              const remainingSeats = course.seat - course.booked;
              // 조건: 남은 좌석 0석이면 마감, 1~2석이면 마감 임박
              const isClosed = remainingSeats <= 0;
              const isUrgent = remainingSeats >= 1 && remainingSeats <= 2;

              return (
                <div
                  key={course.id}
                  className={`relative flex flex-col justify-between p-6 rounded-2xl bg-[#0F1C3F] border transition-all duration-300 shadow-xl hover:-translate-y-1.5 ${
                    isClosed
                      ? "border-zinc-700/80 bg-[#0B1530] opacity-85"
                      : isUrgent
                      ? "border-red-500/60 shadow-red-500/10"
                      : course.isPopular
                      ? "border-amber-400/70 shadow-amber-500/10"
                      : "border-white/10 hover:border-amber-400/50"
                  }`}
                >
                  {/* 상단 아이콘 & 모집 상태 배지 */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl">{course.icon || "📚"}</span>
                    <div className="flex items-center gap-1.5">
                      {/* 조건부 배지: 마감 vs 마감 임박 vs 모집 중 */}
                      {isClosed ? (
                        <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
                          마감
                        </span>
                      ) : isUrgent ? (
                        <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                          마감 임박
                        </span>
                      ) : (
                        <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          모집 중
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 강좌 내용 */}
                  <div>
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-white">
                        {course.name}
                      </h2>
                      {/* 1~2석일 때 타이틀 옆에도 "마감 임박" 빨간색 강조 */}
                      {isUrgent && (
                        <span className="text-xs font-bold text-red-400 bg-red-500/15 px-2 py-0.5 rounded border border-red-500/30">
                          마감 임박
                        </span>
                      )}
                      {/* 0석일 때 "마감" 회색 표시 */}
                      {isClosed && (
                        <span className="text-xs font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                          마감
                        </span>
                      )}
                    </div>

                    {/* 강좌 이름 바로 아래 작은 배지 (tags) */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2 mb-3">
                      {course.tags?.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-amber-400/15 text-amber-300 border border-amber-400/30"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* 일정 안내 */}
                    <div className="flex items-center gap-1 text-xs text-slate-400 font-medium mb-3">
                      <span>🗓️</span>
                      <span>{course.date}</span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4 break-keep min-h-[40px]">
                      {course.description}
                    </p>

                    {/* 정원 및 남은 좌석 표시 영역 */}
                    <div
                      className={`mb-5 p-3 rounded-xl border flex items-center justify-between transition-colors ${
                        isClosed
                          ? "bg-black/50 border-zinc-800"
                          : isUrgent
                          ? "bg-red-950/30 border-red-500/30"
                          : "bg-black/40 border-white/10"
                      }`}
                    >
                      <span className="text-xs text-slate-300 flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isClosed
                              ? "bg-zinc-600"
                              : isUrgent
                              ? "bg-red-500 animate-pulse"
                              : "bg-emerald-400"
                          }`}
                        />
                        <span>모집 현황</span>
                      </span>

                      {/* "남은 좌석 ○석 / 정원 ○명" 표시 및 1~2석 마감 임박 빨간색 */}
                      <div className="text-xs font-bold flex items-center gap-1">
                        {isClosed ? (
                          <span className="text-zinc-400 font-extrabold mr-1">
                            [마감]
                          </span>
                        ) : isUrgent ? (
                          <span className="text-red-400 font-extrabold mr-1 animate-pulse">
                            [마감 임박]
                          </span>
                        ) : null}

                        <span
                          className={
                            isClosed
                              ? "text-zinc-400 font-extrabold"
                              : isUrgent
                              ? "text-red-400 font-extrabold"
                              : "text-amber-300 font-extrabold"
                          }
                        >
                          남은 좌석 {remainingSeats}석
                        </span>
                        <span className="text-slate-400 mx-0.5">/</span>
                        <span className="text-slate-300">
                          정원 {course.seat}명
                        </span>
                      </div>
                    </div>

                    {/* 핵심 커리큘럼 포인트 */}
                    {course.features && course.features.length > 0 && (
                      <div className="border-t border-white/10 pt-4 mb-4">
                        <div className="text-[11px] font-semibold text-amber-400/90 mb-2">
                          KEY CURRICULUM
                        </div>
                        <ul className="space-y-1.5 text-xs text-slate-200">
                          {course.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <span className="text-amber-400 font-bold">✓</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* 수강료 및 버튼 그룹 */}
                  <div className="border-t border-white/10 pt-4 mt-auto">
                    <div className="flex items-baseline justify-between mb-4">
                      <span className="text-xs text-slate-400">원데이 수강료</span>
                      <div className="text-right">
                        <span
                          className={`text-2xl font-extrabold tracking-tight ${
                            isClosed ? "text-zinc-400" : "text-amber-400"
                          }`}
                        >
                          {course.price.toLocaleString()}
                        </span>
                        <span
                          className={`text-sm font-semibold ml-1 ${
                            isClosed ? "text-zinc-500" : "text-amber-200"
                          }`}
                        >
                          원
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setDetailCourse(course)}
                        className="flex-1 py-3 px-2 rounded-xl font-medium text-xs sm:text-sm bg-white/10 hover:bg-white/20 border border-white/10 text-slate-200 transition-colors cursor-pointer text-center"
                      >
                        상세보기
                      </button>

                      {/* 버튼: 남은 좌석 0이면 "예약 마감" 누를 수 없음(disabled) */}
                      {isClosed ? (
                        <button
                          disabled
                          aria-disabled="true"
                          className="flex-2 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm bg-zinc-800 text-zinc-500 border border-zinc-700/80 cursor-not-allowed select-none transition-none shadow-none"
                        >
                          예약 마감
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenReservation(course)}
                          className={`flex-2 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                            isUrgent
                              ? "bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-400 hover:to-amber-400 text-white shadow-lg shadow-red-500/20"
                              : "bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md shadow-amber-500/20"
                          }`}
                        >
                          <span>예약하기</span>
                          <span className="text-xs">→</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 5. 하단 안내 박스 */}
        <div className="mt-12 max-w-4xl w-full p-4 sm:p-5 rounded-xl bg-[#0F1C3F]/60 border border-amber-500/20 text-xs text-slate-300 leading-relaxed break-keep">
          💡 <strong className="text-amber-300">정원 안내:</strong> 남은 좌석이 1~2석인 강좌는 <span className="text-red-400 font-bold">[마감 임박]</span> 상태로 조기 마감될 수 있습니다. 마감된 강좌는 추가 접수가 불가능합니다.
        </div>
      </main>

      {/* 6. 강좌 [상세보기] 모달 */}
      {detailCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#0F1C3F] border border-amber-400/40 rounded-2xl p-6 sm:p-8 shadow-2xl text-left">
            <button
              onClick={() => setDetailCourse(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{detailCourse.icon || "📚"}</span>
              {detailCourse.seat - detailCourse.booked <= 0 ? (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 font-bold">
                  마감
                </span>
              ) : detailCourse.seat - detailCourse.booked <= 2 ? (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 font-bold">
                  마감 임박
                </span>
              ) : (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                  모집 중
                </span>
              )}
            </div>

            <h3 className="text-2xl font-extrabold text-white mb-2">
              {detailCourse.name}
            </h3>

            {/* 강좌 이름 아래 태그 배지 */}
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              {detailCourse.tags?.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-medium bg-amber-400/15 text-amber-300 border border-amber-400/30"
                >
                  {tag}
                </span>
              ))}
            </div>

            <p className="text-sm text-slate-300 mb-4 break-keep leading-relaxed">
              {detailCourse.description}
            </p>

            {/* 일정 & 모집 현황 */}
            <div className="p-3 mb-5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1">
                <span>🗓️</span> {detailCourse.date}
              </span>
              <div className="font-bold flex items-center gap-1.5">
                {detailCourse.seat - detailCourse.booked <= 0 ? (
                  <span className="text-zinc-400 font-extrabold">[마감]</span>
                ) : detailCourse.seat - detailCourse.booked <= 2 ? (
                  <span className="text-red-400 font-extrabold">[마감 임박]</span>
                ) : null}
                <span
                  className={
                    detailCourse.seat - detailCourse.booked <= 0
                      ? "text-zinc-400"
                      : detailCourse.seat - detailCourse.booked <= 2
                      ? "text-red-400"
                      : "text-amber-300"
                  }
                >
                  남은 좌석 {detailCourse.seat - detailCourse.booked}석 / 정원 {detailCourse.seat}명
                </span>
              </div>
            </div>

            <div className="space-y-4 border-t border-white/10 pt-4 mb-6 text-xs sm:text-sm">
              {detailCourse.time && (
                <div>
                  <span className="text-amber-400 font-bold block mb-1">⏱ 진행 시간</span>
                  <p className="text-slate-200">{detailCourse.time}</p>
                </div>
              )}

              {detailCourse.target && (
                <div>
                  <span className="text-amber-400 font-bold block mb-1">🎯 추천 대상</span>
                  <p className="text-slate-200 break-keep">{detailCourse.target}</p>
                </div>
              )}

              {detailCourse.materials && (
                <div>
                  <span className="text-amber-400 font-bold block mb-1">💻 준비물</span>
                  <p className="text-slate-200">{detailCourse.materials}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <div>
                <span className="text-xs text-slate-400">수강료</span>
                <div className="text-xl font-bold text-amber-400">
                  {detailCourse.price.toLocaleString()}원
                </div>
              </div>

              {detailCourse.seat - detailCourse.booked <= 0 ? (
                <button
                  disabled
                  className="px-6 py-3 rounded-xl bg-zinc-800 text-zinc-500 font-bold text-sm border border-zinc-700 cursor-not-allowed select-none"
                >
                  예약 마감
                </button>
              ) : (
                <button
                  onClick={() => handleOpenReservation(detailCourse)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-sm shadow-md hover:scale-105 transition-all cursor-pointer"
                >
                  이 강좌 예약하기
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. [예약하기] 모달 팝업 */}
      {isModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#0F1C3F] border border-amber-400/40 rounded-2xl p-6 sm:p-8 shadow-2xl text-left">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold cursor-pointer"
            >
              ✕
            </button>

            {isSubmitted ? (
              <div className="py-6 text-center">
                <div className="text-5xl mb-3">🎉</div>
                <h3 className="text-xl font-bold text-white mb-2">예약 신청이 접수되었습니다!</h3>
                <div className="inline-block px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 font-mono text-xs font-bold mb-3">
                  예약 번호: {reservationCode}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-4 break-keep">
                  신청하신 <strong className="text-amber-400">[{selectedCourse.name}]</strong> 클래스 안내 문자가 입력하신 연락처(<strong>{userPhone}</strong>)로 발송됩니다.
                </p>
                <div className="p-3 bg-black/40 rounded-xl border border-white/10 text-xs text-slate-300 mb-6">
                  ✨ 일자: <strong>{selectedCourse.date}</strong> | 방금 예약으로 <strong>잔여 좌석이 1석 차감</strong>되었습니다. 관리자 대시보드(<strong>/admin</strong>)에서 신청 내역을 바로 확인하실 수 있습니다.
                </div>
                <button
                  onClick={handleCloseModal}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold transition-all cursor-pointer"
                >
                  확인
                </button>
              </div>
            ) : (
              <>
                <div className="mb-5">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    클래스 예약
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white mt-2 break-keep">
                    {selectedCourse.name}
                  </h3>
                  {/* 강좌 이름 바로 아래 태그 배지 */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5 mb-2">
                    {selectedCourse.tags?.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-full font-medium bg-amber-400/15 text-amber-300 border border-amber-400/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="text-slate-400">
                      일시: <strong className="text-amber-300">{selectedCourse.date}</strong>
                    </span>
                    <span className="text-slate-400">
                      남은 좌석:{" "}
                      <strong className="text-amber-300 font-bold">
                        {selectedCourse.seat - selectedCourse.booked}석 / 정원 {selectedCourse.seat}명
                      </strong>
                    </span>
                  </div>
                  <div className="text-right mt-1">
                    <span className="text-base font-bold text-amber-400">
                      {selectedCourse.price.toLocaleString()}원
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmitReservation} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      예약자 성함 <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="홍길동"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      연락처 (휴대폰 번호) <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="010-1234-5678"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 leading-tight">
                    * 작성해주신 연락처로 클래스 장소 및 준비물 안내 문자가 발송됩니다.
                  </p>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-base transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer mt-2 disabled:opacity-50"
                  >
                    {isSubmitting
                      ? "예약 접수 중..."
                      : `${selectedCourse.price.toLocaleString()}원 예약 확정하기`}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* 8. 푸터 */}
      <footer className="w-full border-t border-amber-500/20 px-6 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 스킬투머니 (Skill to Money). All rights reserved.</p>
          <div className="flex gap-4 items-center">
            <Link href="/admin" className="text-amber-300/80 hover:text-amber-300">
              [관리자 모드]
            </Link>
            <span className="hover:text-amber-300 cursor-pointer">이용약관</span>
            <span className="hover:text-amber-300 cursor-pointer">개인정보처리방침</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
