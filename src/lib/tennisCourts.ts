// 서울특별시 공공서비스예약 테니스장 데이터 관리

import { googleSheetsService } from './googleSheets';

export interface TennisCourt {
  facility_name: string;
  region: string;
  court_number: string;
  time_period: string;
  target: string;
  reservation_method: string;
  fee_info: string;
  address: string;
  phone: string;
  description: string;
}

export interface TennisFacility {
  facility_name: string;
  region: string;
  address: string;
  phone: string;
  courts: TennisCourt[];
}

class TennisCourtsService {
  private static instance: TennisCourtsService;
  private courts: TennisCourt[] = [];
  private facilities: TennisFacility[] = [];
  private lastSyncTime: Date | null = null;
  private syncInterval: number = 5 * 60 * 1000; // 5분마다 동기화

  private constructor() {
    this.loadCourtsData();
    this.startPeriodicSync();
  }

  public static getInstance(): TennisCourtsService {
    if (!TennisCourtsService.instance) {
      TennisCourtsService.instance = new TennisCourtsService();
    }
    return TennisCourtsService.instance;
  }

  private async loadCourtsData(): Promise<void> {
    try {
      // 먼저 구글 시트에서 데이터 로드 시도
      const googleSheetsData = await googleSheetsService.readTennisCourts();
      
      if (googleSheetsData.length > 0) {
        this.courts = googleSheetsData;
        this.lastSyncTime = new Date();
        console.log('구글 시트에서 테니스장 데이터를 로드했습니다.');
      } else {
        // 구글 시트에서 데이터를 가져올 수 없으면 로컬 JSON 파일 사용
        const response = await fetch('/data/seoul_tennis_courts.json');
        if (response.ok) {
          this.courts = await response.json();
          console.log('로컬 JSON 파일에서 테니스장 데이터를 로드했습니다.');
        } else {
          // 폴백 데이터 (기본 테니스장들)
          this.courts = this.getFallbackCourts();
          console.log('폴백 데이터를 사용합니다.');
        }
      }
      
      this.organizeFacilities();
    } catch (error) {
      console.error('테니스장 데이터 로드 실패:', error);
      this.courts = this.getFallbackCourts();
      this.organizeFacilities();
    }
  }

  // 주기적 동기화 시작
  private startPeriodicSync(): void {
    setInterval(async () => {
      try {
        const googleSheetsData = await googleSheetsService.readTennisCourts();
        if (googleSheetsData.length > 0) {
          this.courts = googleSheetsData;
          this.lastSyncTime = new Date();
          this.organizeFacilities();
          console.log('구글 시트와 동기화 완료');
        }
      } catch (error) {
        console.error('주기적 동기화 실패:', error);
      }
    }, this.syncInterval);
  }

  private organizeFacilities(): void {
    const facilityMap = new Map<string, TennisFacility>();

    this.courts.forEach(court => {
      const facilityName = court.facility_name;
      
      if (!facilityMap.has(facilityName)) {
        facilityMap.set(facilityName, {
          facility_name: facilityName,
          region: court.region,
          address: court.address,
          phone: court.phone,
          courts: []
        });
      }

      facilityMap.get(facilityName)!.courts.push(court);
    });

    this.facilities = Array.from(facilityMap.values());
  }

  private getFallbackCourts(): TennisCourt[] {
    return [
      {
        facility_name: '한남테니스장',
        region: '용산구',
        court_number: '3번코트',
        time_period: '주간',
        target: '제한없음',
        reservation_method: '온라인',
        fee_info: '유료',
        address: '서울특별시 용산구 한남동',
        phone: '02-120',
        description: '한남테니스장 3번코트 주간 이용'
      },
      {
        facility_name: '한남테니스장',
        region: '용산구',
        court_number: '4번코트',
        time_period: '주간',
        target: '제한없음',
        reservation_method: '온라인',
        fee_info: '유료',
        address: '서울특별시 용산구 한남동',
        phone: '02-120',
        description: '한남테니스장 4번코트 주간 이용'
      },
      {
        facility_name: '광나루 한강공원 테니스장',
        region: '강동구',
        court_number: '8번 코트',
        time_period: '주말/공휴일',
        target: '제한없음',
        reservation_method: '온라인',
        fee_info: '유료',
        address: '서울특별시 강동구 천호동',
        phone: '02-120',
        description: '광나루 한강공원 테니스장 8번 코트 - 주말,공휴일 이용'
      }
    ];
  }

  // 모든 테니스장 목록 반환
  public getAllCourts(): TennisCourt[] {
    return this.courts;
  }

  // 모든 시설 목록 반환
  public getAllFacilities(): TennisFacility[] {
    return this.facilities;
  }

  // 지역별 테니스장 필터링
  public getCourtsByRegion(region: string): TennisCourt[] {
    return this.courts.filter(court => court.region === region);
  }

  // 시설별 테니스장 필터링
  public getCourtsByFacility(facilityName: string): TennisCourt[] {
    return this.courts.filter(court => court.facility_name === facilityName);
  }

  // 시간대별 테니스장 필터링
  public getCourtsByTimePeriod(timePeriod: string): TennisCourt[] {
    return this.courts.filter(court => court.time_period === timePeriod);
  }

  // 지역 목록 반환
  public getRegions(): string[] {
    const regions = [...new Set(this.courts.map(court => court.region))];
    return regions.sort();
  }

  // 시설 목록 반환
  public getFacilityNames(): string[] {
    const facilities = [...new Set(this.courts.map(court => court.facility_name))];
    return facilities.sort();
  }

  // 시간대 목록 반환
  public getTimePeriods(): string[] {
    const periods = [...new Set(this.courts.map(court => court.time_period))];
    return periods.sort();
  }

  // 검색 기능
  public searchCourts(query: string): TennisCourt[] {
    const lowerQuery = query.toLowerCase();
    return this.courts.filter(court => 
      court.facility_name.toLowerCase().includes(lowerQuery) ||
      court.region.toLowerCase().includes(lowerQuery) ||
      court.address.toLowerCase().includes(lowerQuery) ||
      court.description.toLowerCase().includes(lowerQuery)
    );
  }

  // 특정 코트 정보 반환
  public getCourtInfo(facilityName: string, courtNumber: string): TennisCourt | undefined {
    return this.courts.find(court => 
      court.facility_name === facilityName && 
      court.court_number === courtNumber
    );
  }

  // 시설 정보 반환
  public getFacilityInfo(facilityName: string): TennisFacility | undefined {
    return this.facilities.find(facility => facility.facility_name === facilityName);
  }
}

export const tennisCourtsService = TennisCourtsService.getInstance();
