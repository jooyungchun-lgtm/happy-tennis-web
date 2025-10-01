import { NextRequest, NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/googleSheets';
import { TennisCourt } from '@/lib/tennisCourts';

// POST: 새 테니스장 추가
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const court: TennisCourt = body;
    
    // 필수 필드 검증
    if (!court.facility_name || !court.region || !court.court_number) {
      return NextResponse.json({
        success: false,
        error: '시설명, 지역, 코트번호는 필수입니다.'
      }, { status: 400 });
    }
    
    const success = await googleSheetsService.addTennisCourt(court);
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: `새 테니스장이 추가되었습니다: ${court.facility_name} - ${court.court_number}`
      });
    } else {
      return NextResponse.json({
        success: false,
        error: '테니스장 추가에 실패했습니다.'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('테니스장 추가 실패:', error);
    
    return NextResponse.json({
      success: false,
      error: '테니스장 추가 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}
