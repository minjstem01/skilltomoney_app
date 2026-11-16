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

  // 예약 폼 상태 (이름, 연락처, 인원, 제출 중 여부, 안내 문구)
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [headcount, setHeadcount] = useState<number | string>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guideMessage, setGuideMessage] = useState("");
  const [toastMessage, setToastMessage] = useState("");

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
    setUserName("");
    setUserPhone("");
    setHeadcount(1);
    setIsSubmitting(false);
    setGuideMessage("");
    setIsModalOpen(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
    setUserName("");
    setUserPhone("");
    setHeadcount(1);
    setIsSubmitting(false);
    setGuideMessage("");
  };

  // [신청] 버튼 클릭 핸들러: Next.js 서버 쪽 API(app/api/reserve) 호출
  const handleApplyReservation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!selectedCourse) return;

    // 1. 이름이 비어 있는지 검사
    if (!userName.trim()) {
      const msg = "이름을 입력해 주세요.";
      setGuideMessage(msg);
      alert(msg);
      return;
    }

    // 2. 인원이 남은 자리보다 많은지 검사
    const remainingSeats = selectedCourse.seat - selectedCourse.booked;
    const peopleCount = Number(headcount);

    if (!peopleCount || peopleCount < 1) {
      const msg = "인원은 1명 이상이어야 합니다.";
      setGuideMessage(msg);
      alert(msg);
      return;
    }

    if (peopleCount > remainingSeats) {
      const msg = `신청 인원이 남은 자리(${remainingSeats}석)보다 많습니다.`;
      setGuideMessage(msg);
      alert(msg);
      return;
    }

    // 3. 연락처 검사
    if (!userPhone.trim()) {
      const msg = "연락처를 입력해 주세요.";
      setGuideMessage(msg);
      alert(msg);
      return;
    }

    setGuideMessage("");

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/reserve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: selectedCourse.date,
          course: selectedCourse.name,
          name: userName.trim(),
          phone: userPhone.trim(),
          people: peopleCount,
        }),
      });

      const json = await res.json();
      if (json.success) {
        alert("예약 신청이 완료되었습니다");
        setToastMessage("예약 신청이 완료되었습니다");
        setTimeout(() => setToastMessage(""), 4000);

        setCourses((prev) =>
          prev.map((c) =>
            c.id === selectedCourse.id
              ? { ...c, booked: Math.min(c.seat, c.booked + peopleCount) }
              : c
          )
        );
        handleCloseModal();
      } else {
        const errorMsg = json.message || "예약 신청에 실패했습니다.";
        setGuideMessage(errorMsg);
        alert(errorMsg);
      }
    } catch {
      const networkMsg = "서버 연결에 실패했습니다. 다시 시도해 주세요.";
      setGuideMessage(networkMsg);
      alert(networkMsg);
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

      {/* 예약 성공 알림 토스트 배너 */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-600 border border-emerald-400/50 text-white font-bold text-sm shadow-2xl flex items-center gap-2.5">
          <span className="text-lg">🎉</span>
          <span>{toastMessage}</span>
        </div>
      )}

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

      {/* 7. 예약 신청 창 (모달) */}
      {isModalOpen && selectedCourse && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
        >
          <div className="relative w-full max-w-md bg-[#0F1C3F] border border-amber-400/40 rounded-2xl p-6 sm:p-8 shadow-2xl text-left">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold cursor-pointer transition-colors"
              aria-label="닫기"
            >
              ✕
            </button>

            <div className="mb-6">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                예약 신청
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-2">
                예약 신청
              </h2>
            </div>

            <form onSubmit={handleApplyReservation} noValidate className="space-y-4">
              {/* 강좌 이름 (카드에서 자동 채움) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  강좌 이름
                </label>
                <input
                  type="text"
                  value={selectedCourse.name}
                  readOnly
                  className="w-full px-3.5 py-2.5 rounded-lg bg-black/50 border border-white/10 text-amber-300 font-medium text-sm cursor-not-allowed focus:outline-none select-none"
                />
              </div>

              {/* 날짜 (카드에서 자동 채움) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  날짜
                </label>
                <input
                  type="text"
                  value={selectedCourse.date}
                  readOnly
                  className="w-full px-3.5 py-2.5 rounded-lg bg-black/50 border border-white/10 text-amber-300 font-medium text-sm cursor-not-allowed focus:outline-none select-none"
                />
              </div>

              {/* 이름 */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  이름 <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="이름을 입력하세요"
                  value={userName}
                  onChange={(e) => {
                    setUserName(e.target.value);
                    if (guideMessage) setGuideMessage("");
                  }}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-black/40 border border-white/15 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* 연락처 */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  연락처 <span className="text-amber-400">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="010-1234-5678"
                  value={userPhone}
                  onChange={(e) => {
                    setUserPhone(e.target.value);
                    if (guideMessage) setGuideMessage("");
                  }}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-black/40 border border-white/15 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* 인원(숫자) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    인원(숫자) <span className="text-amber-400">*</span>
                  </label>
                  <span className="text-xs text-amber-400 font-medium">
                    (남은 자리: {selectedCourse.seat - selectedCourse.booked}석)
                  </span>
                </div>
                <input
                  type="number"
                  min={1}
                  placeholder="1"
                  value={headcount}
                  onChange={(e) => {
                    setHeadcount(e.target.value === "" ? "" : Number(e.target.value));
                    if (guideMessage) setGuideMessage("");
                  }}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-black/40 border border-white/15 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* 안내 문구 표시 영역 */}
              {guideMessage && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{guideMessage}</span>
                </div>
              )}

              {/* 하단 [신청]과 [닫기] 버튼 */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "저장 중..." : "신청"}
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleCloseModal}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-colors cursor-pointer text-center disabled:opacity-50"
                >
                  닫기
                </button>
              </div>
            </form>
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
