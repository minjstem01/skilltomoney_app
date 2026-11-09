import { NextResponse } from "next/server";

// 서버 메모리 내 예약 저장소
export interface Reservation {
  id: string;
  courseName: string;
  price: number;
  userName: string;
  userPhone: string;
  createdAt: string;
}

// 초기 샘플 데이터
let reservations: Reservation[] = [
  {
    id: "RES-1001",
    courseName: "AI 자동화",
    price: 35000,
    userName: "이서연",
    userPhone: "010-9876-5432",
    createdAt: "2026-11-06 14:20",
  },
  {
    id: "RES-1002",
    courseName: "숏폼 편집",
    price: 45000,
    userName: "박도윤",
    userPhone: "010-3333-7777",
    createdAt: "2026-11-06 17:05",
  },
];

// GET: 예약 목록 조회
export async function GET() {
  return NextResponse.json({
    success: true,
    data: reservations,
    totalCount: reservations.length,
  });
}

// POST: 새 예약 등록
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { courseName, price, userName, userPhone } = body;

    if (!courseName || !userName || !userPhone) {
      return NextResponse.json(
        { success: false, message: "필수 정보가 누락되었습니다." },
        { status: 400 }
      );
    }

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(
      now.getHours()
    ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newReservation: Reservation = {
      id: `RES-${Date.now().toString().slice(-4)}`,
      courseName,
      price: price || 0,
      userName,
      userPhone,
    createdAt: formattedDate,
    };

    reservations.unshift(newReservation);

    return NextResponse.json({
      success: true,
      message: "예약이 성공적으로 접수되었습니다.",
      data: newReservation,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "요청 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// DELETE: 예약 취소/삭제
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "예약 ID가 필요합니다." },
        { status: 400 }
      );
    }

    reservations = reservations.filter((item) => item.id !== id);

    return NextResponse.json({
      success: true,
      message: "예약이 삭제되었습니다.",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "삭제 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
