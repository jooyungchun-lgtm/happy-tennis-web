// 구글 시트 API 연동 서비스

import { google } from 'googleapis';
import { TennisCourt } from './tennisCourts';

interface GoogleSheetsConfig {
  spreadsheetId: string;
  range: string;
  credentials?: Record<string, unknown>;
}

class GoogleSheetsService {
  private static instance: GoogleSheetsService;
  private sheets: unknown;
  private config: GoogleSheetsConfig;

  private constructor() {
    this.config = {
      spreadsheetId: '1hOJiNMx1Uve6hjkgoBXtvLWPERdpjSZQFiHjQYh4rUw',
      range: '시트1!A:J', // A부터 J열까지
    };
    
    this.initializeSheets();
  }

  public static getInstance(): GoogleSheetsService {
    if (!GoogleSheetsService.instance) {
      GoogleSheetsService.instance = new GoogleSheetsService();
    }
    return GoogleSheetsService.instance;
  }

  private async initializeSheets(): Promise<void> {
    try {
      // 환경변수에서 인증 정보 가져오기
      const credentials = process.env.GOOGLE_SHEETS_CREDENTIALS;
      
      if (credentials) {
        const auth = new google.auth.GoogleAuth({
          credentials: JSON.parse(credentials),
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        this.sheets = google.sheets({ version: 'v4', auth });
      } else {
        // 공개 시트인 경우 인증 없이 접근 (읽기 전용)
        this.sheets = google.sheets({ version: 'v4' });
      }
    } catch (error) {
      console.error('구글 시트 초기화 실패:', error);
    }
  }

  // 시트에서 테니스장 데이터 읽기
  public async readTennisCourts(): Promise<TennisCourt[]> {
    try {
      if (!this.sheets) {
        await this.initializeSheets();
      }

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.config.spreadsheetId,
        range: this.config.range,
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        console.log('시트에 데이터가 없습니다.');
        return [];
      }

      // 첫 번째 행은 헤더이므로 제외
      const dataRows = rows.slice(1);
      
      const tennisCourts: TennisCourt[] = dataRows
        .filter(row => row.length >= 6) // 최소 필요한 컬럼이 있는지 확인
        .map((row) => ({
          facility_name: row[0] || '',
          region: row[1] || '',
          court_number: row[4] || '',
          time_period: row[5] || '',
          target: row[6] || '제한없음',
          reservation_method: row[7] || '온라인',
          fee_info: row[8] || '유료',
          address: row[2] || '',
          phone: row[3] || '02-120',
          description: row[9] || '',
        }));

      console.log(`구글 시트에서 ${tennisCourts.length}개의 테니스장 데이터를 읽었습니다.`);
      return tennisCourts;

    } catch (error) {
      console.error('구글 시트 읽기 실패:', error);
      return [];
    }
  }

  // 시트에 테니스장 데이터 쓰기
  public async writeTennisCourts(courts: TennisCourt[]): Promise<boolean> {
    try {
      if (!this.sheets) {
        await this.initializeSheets();
      }

      // 헤더 행
      const headers = [
        '시설명',
        '지역',
        '주소',
        '전화번호',
        '코트번호',
        '시간대',
        '이용대상',
        '예약방법',
        '요금정보',
        '설명'
      ];

      // 데이터 행들
      const values = courts.map(court => [
        court.facility_name,
        court.region,
        court.address,
        court.phone,
        court.court_number,
        court.time_period,
        court.target,
        court.reservation_method,
        court.fee_info,
        court.description
      ]);

      // 헤더와 데이터를 합치기
      const allValues = [headers, ...values];

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.config.spreadsheetId,
        range: this.config.range,
        valueInputOption: 'RAW',
        resource: {
          values: allValues,
        },
      });

      console.log(`구글 시트에 ${courts.length}개의 테니스장 데이터를 썼습니다.`);
      return true;

    } catch (error) {
      console.error('구글 시트 쓰기 실패:', error);
      return false;
    }
  }

  // 특정 행에 테니스장 추가
  public async addTennisCourt(court: TennisCourt): Promise<boolean> {
    try {
      if (!this.sheets) {
        await this.initializeSheets();
      }

      const values = [
        [
          court.facility_name,
          court.region,
          court.address,
          court.phone,
          court.court_number,
          court.time_period,
          court.target,
          court.reservation_method,
          court.fee_info,
          court.description
        ]
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.config.spreadsheetId,
        range: '시트1!A:J',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: values,
        },
      });

      console.log(`새 테니스장이 추가되었습니다: ${court.facility_name} - ${court.court_number}`);
      return true;

    } catch (error) {
      console.error('테니스장 추가 실패:', error);
      return false;
    }
  }

  // 시트 정보 가져오기
  public async getSheetInfo(): Promise<Record<string, unknown>> {
    try {
      if (!this.sheets) {
        await this.initializeSheets();
      }

      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.config.spreadsheetId,
      });

      return {
        title: response.data.properties.title,
        sheets: response.data.sheets.map((sheet: Record<string, unknown>) => ({
          title: sheet.properties.title,
          rowCount: sheet.properties.gridProperties.rowCount,
          columnCount: sheet.properties.gridProperties.columnCount,
        })),
      };

    } catch (error) {
      console.error('시트 정보 가져오기 실패:', error);
      return null;
    }
  }

  // 시트 URL 반환
  public getSheetUrl(): string {
    return `https://docs.google.com/spreadsheets/d/${this.config.spreadsheetId}/edit`;
  }
}

export const googleSheetsService = GoogleSheetsService.getInstance();
