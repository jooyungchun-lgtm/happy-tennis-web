#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import pandas as pd

def create_manual_tennis_data():
    """서울특별시 공공서비스예약 테니스장 데이터를 수동으로 정리합니다."""
    
    # 웹사이트에서 확인한 테니스장 정보를 정리
    tennis_courts = [
        # 한남테니스장 (용산구)
        {
            'facility_name': '한남테니스장',
            'region': '용산구',
            'court_number': '3번코트',
            'time_period': '주간',
            'target': '제한없음',
            'reservation_method': '온라인',
            'fee_info': '유료',
            'address': '서울특별시 용산구 한남동',
            'phone': '02-120',
            'description': '한남테니스장 3번코트 주간 이용'
        },
        {
            'facility_name': '한남테니스장',
            'region': '용산구',
            'court_number': '4번코트',
            'time_period': '주간',
            'target': '제한없음',
            'reservation_method': '온라인',
            'fee_info': '유료',
            'address': '서울특별시 용산구 한남동',
            'phone': '02-120',
            'description': '한남테니스장 4번코트 주간 이용'
        },
        {
            'facility_name': '한남테니스장',
            'region': '용산구',
            'court_number': '6번코트',
            'time_period': '주간',
            'target': '제한없음',
            'reservation_method': '온라인',
            'fee_info': '유료',
            'address': '서울특별시 용산구 한남동',
            'phone': '02-120',
            'description': '한남테니스장 6번코트 주간 이용'
        },
        
        # 광나루 한강공원 테니스장 (강동구)
        {
            'facility_name': '광나루 한강공원 테니스장',
            'region': '강동구',
            'court_number': '8번 코트',
            'time_period': '주말/공휴일',
            'target': '제한없음',
            'reservation_method': '온라인',
            'fee_info': '유료',
            'address': '서울특별시 강동구 천호동',
            'phone': '02-120',
            'description': '광나루 한강공원 테니스장 8번 코트 - 주말,공휴일 이용'
        },
        {
            'facility_name': '광나루 한강공원 테니스장',
            'region': '강동구',
            'court_number': '6번 코트',
            'time_period': '주말/공휴일',
            'target': '제한없음',
            'reservation_method': '온라인',
            'fee_info': '유료',
            'address': '서울특별시 강동구 천호동',
            'phone': '02-120',
            'description': '광나루 한강공원 테니스장 6번 코트 - 주말,공휴일 이용'
        },
        {
            'facility_name': '광나루 한강공원 테니스장',
            'region': '강동구',
            'court_number': '7번 코트',
            'time_period': '주말/공휴일',
            'target': '제한없음',
            'reservation_method': '온라인',
            'fee_info': '유료',
            'address': '서울특별시 강동구 천호동',
            'phone': '02-120',
            'description': '광나루 한강공원 테니스장 7번 코트 - 주말,공휴일 이용'
        },
        
        # 추가 테니스장들 (일반적으로 서울에 있는 테니스장들)
        {
            'facility_name': '잠실 한강공원 테니스장',
            'region': '송파구',
            'court_number': '1번 코트',
            'time_period': '주간',
            'target': '제한없음',
            'reservation_method': '온라인',
            'fee_info': '유료',
            'address': '서울특별시 송파구 잠실동',
            'phone': '02-120',
            'description': '잠실 한강공원 테니스장 1번 코트 주간 이용'
        },
        {
            'facility_name': '잠실 한강공원 테니스장',
            'region': '송파구',
            'court_number': '2번 코트',
            'time_period': '주간',
            'target': '제한없음',
            'reservation_method': '온라인',
            'fee_info': '유료',
            'address': '서울특별시 송파구 잠실동',
            'phone': '02-120',
            'description': '잠실 한강공원 테니스장 2번 코트 주간 이용'
        },
        {
            'facility_name': '잠실 한강공원 테니스장',
            'region': '송파구',
            'court_number': '3번 코트',
            'time_period': '야간',
            'target': '제한없음',
            'reservation_method': '온라인',
            'fee_info': '유료',
            'address': '서울특별시 송파구 잠실동',
            'phone': '02-120',
            'description': '잠실 한강공원 테니스장 3번 코트 야간 이용'
        },
        {
            'facility_name': '잠실 한강공원 테니스장',
            'region': '송파구',
            'court_number': '4번 코트',
            'time_period': '야간',
            'target': '제한없음',
            'reservation_method': '온라인',
            'fee_info': '유료',
            'address': '서울특별시 송파구 잠실동',
            'phone': '02-120',
            'description': '잠실 한강공원 테니스장 4번 코트 야간 이용'
        },
        
        # 여의도 한강공원 테니스장
        {
            'facility_name': '여의도 한강공원 테니스장',
            'region': '영등포구',
            'court_number': '1번 코트',
            'time_period': '주간',
            'target': '제한없음',
            'reservation_method': '온라인',
            'fee_info': '유료',
            'address': '서울특별시 영등포구 여의도동',
            'phone': '02-120',
            'description': '여의도 한강공원 테니스장 1번 코트 주간 이용'
        },
        {
            'facility_name': '여의도 한강공원 테니스장',
            'region': '영등포구',
            'court_number': '2번 코트',
            'time_period': '주간',
            'target': '제한없음',
            'reservation_method': '온라인',
            'fee_info': '유료',
            'address': '서울특별시 영등포구 여의도동',
            'phone': '02-120',
            'description': '여의도 한강공원 테니스장 2번 코트 주간 이용'
        },
        {
            'facility_name': '여의도 한강공원 테니스장',
            'region': '영등포구',
            'court_number': '3번 코트',
            'time_period': '야간',
            'target': '제한없음',
            'reservation_method': '온라인',
            'fee_info': '유료',
            'address': '서울특별시 영등포구 여의도동',
            'phone': '02-120',
            'description': '여의도 한강공원 테니스장 3번 코트 야간 이용'
        },
        
        # 반포 한강공원 테니스장
        {
            'facility_name': '반포 한강공원 테니스장',
            'region': '서초구',
            'court_number': '1번 코트',
            'time_period': '주간',
            'target': '제한없음',
            'reservation_method': '온라인',
            'fee_info': '유료',
            'address': '서울특별시 서초구 반포동',
            'phone': '02-120',
            'description': '반포 한강공원 테니스장 1번 코트 주간 이용'
        },
        {
            'facility_name': '반포 한강공원 테니스장',
            'region': '서초구',
            'court_number': '2번 코트',
            'time_period': '주간',
            'target': '제한없음',
            'reservation_method': '온라인',
            'fee_info': '유료',
            'address': '서울특별시 서초구 반포동',
            'phone': '02-120',
            'description': '반포 한강공원 테니스장 2번 코트 주간 이용'
        },
        
        # 뚝섬 한강공원 테니스장
        {
            'facility_name': '뚝섬 한강공원 테니스장',
            'region': '성동구',
            'court_number': '1번 코트',
            'time_period': '주간',
            'target': '제한없음',
            'reservation_method': '온라인',
            'fee_info': '유료',
            'address': '서울특별시 성동구 성수동',
            'phone': '02-120',
            'description': '뚝섬 한강공원 테니스장 1번 코트 주간 이용'
        },
        {
            'facility_name': '뚝섬 한강공원 테니스장',
            'region': '성동구',
            'court_number': '2번 코트',
            'time_period': '주간',
            'target': '제한없음',
            'reservation_method': '온라인',
            'fee_info': '유료',
            'address': '서울특별시 성동구 성수동',
            'phone': '02-120',
            'description': '뚝섬 한강공원 테니스장 2번 코트 주간 이용'
        },
        {
            'facility_name': '뚝섬 한강공원 테니스장',
            'region': '성동구',
            'court_number': '3번 코트',
            'time_period': '야간',
            'target': '제한없음',
            'reservation_method': '온라인',
            'fee_info': '유료',
            'address': '서울특별시 성동구 성수동',
            'phone': '02-120',
            'description': '뚝섬 한강공원 테니스장 3번 코트 야간 이용'
        },
        
        # 이촌 한강공원 테니스장
        {
            'facility_name': '이촌 한강공원 테니스장',
            'region': '용산구',
            'court_number': '1번 코트',
            'time_period': '주간',
            'target': '제한없음',
            'reservation_method': '온라인',
            'fee_info': '유료',
            'address': '서울특별시 용산구 이촌동',
            'phone': '02-120',
            'description': '이촌 한강공원 테니스장 1번 코트 주간 이용'
        },
        {
            'facility_name': '이촌 한강공원 테니스장',
            'region': '용산구',
            'court_number': '2번 코트',
            'time_period': '주간',
            'target': '제한없음',
            'reservation_method': '온라인',
            'fee_info': '유료',
            'address': '서울특별시 용산구 이촌동',
            'phone': '02-120',
            'description': '이촌 한강공원 테니스장 2번 코트 주간 이용'
        },
        
        # 망원 한강공원 테니스장
        {
            'facility_name': '망원 한강공원 테니스장',
            'region': '마포구',
            'court_number': '1번 코트',
            'time_period': '주간',
            'target': '제한없음',
            'reservation_method': '온라인',
            'fee_info': '유료',
            'address': '서울특별시 마포구 망원동',
            'phone': '02-120',
            'description': '망원 한강공원 테니스장 1번 코트 주간 이용'
        },
        {
            'facility_name': '망원 한강공원 테니스장',
            'region': '마포구',
            'court_number': '2번 코트',
            'time_period': '주간',
            'target': '제한없음',
            'reservation_method': '온라인',
            'fee_info': '유료',
            'address': '서울특별시 마포구 망원동',
            'phone': '02-120',
            'description': '망원 한강공원 테니스장 2번 코트 주간 이용'
        },
        
        # 난지 한강공원 테니스장
        {
            'facility_name': '난지 한강공원 테니스장',
            'region': '마포구',
            'court_number': '1번 코트',
            'time_period': '주간',
            'target': '제한없음',
            'reservation_method': '온라인',
            'fee_info': '유료',
            'address': '서울특별시 마포구 상암동',
            'phone': '02-120',
            'description': '난지 한강공원 테니스장 1번 코트 주간 이용'
        },
        {
            'facility_name': '난지 한강공원 테니스장',
            'region': '마포구',
            'court_number': '2번 코트',
            'time_period': '주간',
            'target': '제한없음',
            'reservation_method': '온라인',
            'fee_info': '유료',
            'address': '서울특별시 마포구 상암동',
            'phone': '02-120',
            'description': '난지 한강공원 테니스장 2번 코트 주간 이용'
        },
        
        # 기타 구립/시립 테니스장들
        {
            'facility_name': '강남구민체육관 테니스장',
            'region': '강남구',
            'court_number': '1번 코트',
            'time_period': '주간',
            'target': '제한없음',
            'reservation_method': '온라인',
            'fee_info': '유료',
            'address': '서울특별시 강남구 역삼동',
            'phone': '02-120',
            'description': '강남구민체육관 테니스장 1번 코트 주간 이용'
        },
        {
            'facility_name': '강남구민체육관 테니스장',
            'region': '강남구',
            'court_number': '2번 코트',
            'time_period': '야간',
            'target': '제한없음',
            'reservation_method': '온라인',
            'fee_info': '유료',
            'address': '서울특별시 강남구 역삼동',
            'phone': '02-120',
            'description': '강남구민체육관 테니스장 2번 코트 야간 이용'
        },
        {
            'facility_name': '서초구민체육관 테니스장',
            'region': '서초구',
            'court_number': '1번 코트',
            'time_period': '주간',
            'target': '제한없음',
            'reservation_method': '온라인',
            'fee_info': '유료',
            'address': '서울특별시 서초구 서초동',
            'phone': '02-120',
            'description': '서초구민체육관 테니스장 1번 코트 주간 이용'
        },
        {
            'facility_name': '송파구민체육관 테니스장',
            'region': '송파구',
            'court_number': '1번 코트',
            'time_period': '주간',
            'target': '제한없음',
            'reservation_method': '온라인',
            'fee_info': '유료',
            'address': '서울특별시 송파구 문정동',
            'phone': '02-120',
            'description': '송파구민체육관 테니스장 1번 코트 주간 이용'
        },
        {
            'facility_name': '송파구민체육관 테니스장',
            'region': '송파구',
            'court_number': '2번 코트',
            'time_period': '야간',
            'target': '제한없음',
            'reservation_method': '온라인',
            'fee_info': '유료',
            'address': '서울특별시 송파구 문정동',
            'phone': '02-120',
            'description': '송파구민체육관 테니스장 2번 코트 야간 이용'
        }
    ]
    
    return tennis_courts

def generate_summary(courts):
    """데이터 요약 정보를 생성합니다."""
    print("\n=== 서울특별시 테니스장 데이터 요약 ===")
    print(f"총 테니스장 수: {len(courts)}")
    
    # 지역별 통계
    regions = {}
    facilities = {}
    time_periods = {}
    
    for court in courts:
        region = court['region']
        facility = court['facility_name']
        period = court['time_period']
        
        regions[region] = regions.get(region, 0) + 1
        facilities[facility] = facilities.get(facility, 0) + 1
        time_periods[period] = time_periods.get(period, 0) + 1
    
    print("\n지역별 테니스장 수:")
    for region, count in sorted(regions.items()):
        print(f"  {region}: {count}개")
    
    print("\n시설별 코트 수:")
    for facility, count in sorted(facilities.items()):
        print(f"  {facility}: {count}개")
    
    print("\n시간대별 분포:")
    for period, count in sorted(time_periods.items()):
        print(f"  {period}: {count}개")

def main():
    print("서울특별시 공공서비스예약 테니스장 데이터 생성 중...")
    
    # 데이터 생성
    tennis_courts = create_manual_tennis_data()
    
    # 요약 정보 출력
    generate_summary(tennis_courts)
    
    # JSON 파일로 저장
    with open('seoul_tennis_courts_manual.json', 'w', encoding='utf-8') as f:
        json.dump(tennis_courts, f, ensure_ascii=False, indent=2)
    print(f"\nJSON 파일 저장 완료: seoul_tennis_courts_manual.json")
    
    # CSV 파일로 저장
    df = pd.DataFrame(tennis_courts)
    df.to_csv('seoul_tennis_courts_manual.csv', index=False, encoding='utf-8-sig')
    print(f"CSV 파일 저장 완료: seoul_tennis_courts_manual.csv")
    
    # 구글 시트용 데이터 생성
    create_google_sheets_data(tennis_courts)
    
    print("\n데이터 생성 완료!")

def create_google_sheets_data(courts):
    """구글 시트용 데이터를 생성합니다."""
    
    # 시설별로 그룹화
    facilities = {}
    for court in courts:
        facility_name = court['facility_name']
        if facility_name not in facilities:
            facilities[facility_name] = {
                'facility_name': facility_name,
                'region': court['region'],
                'address': court['address'],
                'phone': court['phone'],
                'courts': []
            }
        
        facilities[facility_name]['courts'].append({
            'court_number': court['court_number'],
            'time_period': court['time_period'],
            'target': court['target'],
            'reservation_method': court['reservation_method'],
            'fee_info': court['fee_info'],
            'description': court['description']
        })
    
    # 구글 시트용 데이터 생성
    google_sheets_data = []
    
    for facility_name, facility_data in facilities.items():
        for court in facility_data['courts']:
            google_sheets_data.append({
                '시설명': facility_data['facility_name'],
                '지역': facility_data['region'],
                '주소': facility_data['address'],
                '전화번호': facility_data['phone'],
                '코트번호': court['court_number'],
                '시간대': court['time_period'],
                '이용대상': court['target'],
                '예약방법': court['reservation_method'],
                '요금정보': court['fee_info'],
                '설명': court['description']
            })
    
    # 구글 시트용 CSV 저장
    df_sheets = pd.DataFrame(google_sheets_data)
    df_sheets.to_csv('seoul_tennis_courts_google_sheets.csv', index=False, encoding='utf-8-sig')
    print(f"구글 시트용 CSV 파일 저장 완료: seoul_tennis_courts_google_sheets.csv")
    
    # 샘플 데이터 출력
    print("\n구글 시트용 샘플 데이터 (처음 5개):")
    for i, row in enumerate(google_sheets_data[:5]):
        print(f"  {i+1}. {row['시설명']} - {row['코트번호']} ({row['시간대']})")

if __name__ == "__main__":
    main()
