import { NextRequest, NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/googleSheets';
import { TennisCourt } from '@/lib/tennisCourts';

// GET: 구글 시트에서 테니스장 데이터 가져오기
export async function GET() {
  try {
    const courts = await googleSheetsService.readTennisCourts();
    
    return NextResponse.json({
      success: true,
      data: courts,
      count: courts.length
    });
  } catch (error) {
    console.error('테니스장 데이터 가져오기 실패:', error);
    
    return NextResponse.json({
      success: false,
      error: '테니스장 데이터를 가져올 수 없습니다.',
      data: []
    }, { status: 500 });
  }
}

// POST: 구글 시트에 테니스장 데이터 업로드
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courts }: { courts: TennisCourt[] } = body;
    
    if (!courts || !Array.isArray(courts)) {
      return NextResponse.json({
        success: false,
        error: '올바른 테니스장 데이터를 제공해주세요.'
      }, { status: 400 });
    }
    
    const success = await googleSheetsService.writeTennisCourts(courts);
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: `${courts.length}개의 테니스장 데이터가 업로드되었습니다.`
      });
    } else {
      return NextResponse.json({
        success: false,
        error: '구글 시트 업로드에 실패했습니다.'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('테니스장 데이터 업로드 실패:', error);
    
    return NextResponse.json({
      success: false,
      error: '테니스장 데이터 업로드 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}
