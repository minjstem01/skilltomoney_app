import { NextResponse } from "next/server";
import { courses } from "@/data/courses";

// .env 또는 public/.env에서 SHEET_URL 가져오기
async function getSheetUrl(): Promise<string | null> {
  if (process.env.SHEET_URL) {
    return process.env.SHEET_URL.trim();
  }

  try {
    const fs = await import("fs");
    const path = await import("path");
    const candidates = [
      path.resolve(process.cwd(), ".env"),
      path.resolve(process.cwd(), ".env.local"),
      path.resolve(process.cwd(), "public", ".env"),
    ];

    for (const filePath of candidates) {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf-8");
        const match = content.match(/SHEET_URL\s*=\s*["']?([^"'\r\n]+)["']?/);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
    }
  } catch (err) {
    console.error("환경변수 파일 로딩 실패:", err);
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, course, name, phone, people } = body;

    // 1. 필수 입력값 검증
    if (!name || !phone) {
      return NextResponse.json(
        { success: false, message: "이름과 연락처를 모두 입력해 주세요." },
        { status: 400 }
      );
    }

    // 2. 강좌 데이터에서 수강료를 조회하여 결제 금액(total) 계산
    // 결제 금액(total)은 화면이 보낸 값이 아니라 서버가 강좌 데이터의 수강료 × 인원으로 계산
    const matchedCourse = courses.find(
      (c: any) => c.name === course || c.id === course
    );

    const unitPrice = matchedCourse ? matchedCourse.price : 0;
    const peopleCount = Math.max(1, parseInt(String(people), 10) || 1);
    const total = unitPrice * peopleCount;

    // 최종 전송할 데이터 구성
    const reserveData = {
      date: date || (matchedCourse ? matchedCourse.date : ""),
      course: matchedCourse ? matchedCourse.name : course,
      name: String(name).trim(),
      phone: String(phone).trim(),
      people: peopleCount,
      total,
    };

    // 3. .env의 SHEET_URL 조회 (시트 주소는 브라우저에 노출되지 않고 서버에서만 사용)
    const sheetUrl = await getSheetUrl();

    if (!sheetUrl) {
      console.error("SHEET_URL이 설정되지 않았습니다.");
      return NextResponse.json(
        {
          success: false,
          message: ".env 파일에 SHEET_URL이 설정되어 있지 않습니다.",
        },
        { status: 500 }
      );
    }

    // 4. SHEET_URL 주소로 JSON 데이터 전송
    const sheetResponse = await fetch(sheetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reserveData),
      redirect: "follow",
    });

    let sheetResult: any = null;
    try {
      const text = await sheetResponse.text();
      try {
        sheetResult = JSON.parse(text);
      } catch {
        sheetResult = { message: text };
      }
    } catch (parseErr) {
      console.warn("구글 시트 응답 파싱 실패 (전송은 완료됨):", parseErr);
    }

    return NextResponse.json({
      success: true,
      message: "예약 신청이 성공적으로 전달되었습니다.",
      data: reserveData,
      sheetResult,
    });
  } catch (error: any) {
    console.error("예약 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "서버에서 예약 처리 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
