#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
from bs4 import BeautifulSoup
import json
import time
import re
from urllib.parse import urljoin, urlparse
import pandas as pd

class SeoulTennisScraper:
    def __init__(self):
        self.base_url = "https://yeyak.seoul.go.kr"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.tennis_courts = []
        
    def scrape_tennis_courts(self):
        """테니스장 목록을 스크래핑합니다."""
        print("서울특별시 공공서비스예약 테니스장 데이터 수집 시작...")
        
        # 테니스장 검색 페이지 URL
        search_url = "https://yeyak.seoul.go.kr/web/search/selectPageListDetailSearchImg.do"
        
        # 검색 파라미터 설정
        params = {
            'code': 'T100',
            'dCode': 'T108',
            'searchCondition': 'tennis',
            'searchKeyword': '',
            'pageIndex': 1,
            'pageSize': 1000  # 한 번에 많은 데이터 가져오기
        }
        
        try:
            response = self.session.get(search_url, params=params)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # 테니스장 목록 추출
            self.extract_tennis_courts(soup)
            
            # 페이지네이션 처리
            self.handle_pagination(soup)
            
        except Exception as e:
            print(f"스크래핑 중 오류 발생: {e}")
            
    def extract_tennis_courts(self, soup):
        """HTML에서 테니스장 정보를 추출합니다."""
        # 테니스장 목록 컨테이너 찾기
        court_items = soup.find_all('div', class_='item')
        
        for item in court_items:
            try:
                court_info = self.parse_court_item(item)
                if court_info:
                    self.tennis_courts.append(court_info)
                    print(f"추출된 테니스장: {court_info['name']}")
            except Exception as e:
                print(f"아이템 파싱 오류: {e}")
                continue
                
    def parse_court_item(self, item):
        """개별 테니스장 아이템을 파싱합니다."""
        try:
            # 테니스장 이름 추출
            name_element = item.find('h3') or item.find('h4') or item.find('strong')
            if not name_element:
                return None
                
            name = name_element.get_text(strip=True)
            
            # 지역 정보 추출 (괄호 안의 내용)
            region_match = re.search(r'\(([^)]+)\)', name)
            region = region_match.group(1) if region_match else ""
            
            # 코트 번호 추출
            court_number_match = re.search(r'(\d+)번', name)
            court_number = court_number_match.group(1) if court_number_match else ""
            
            # 시간대 추출 (주간/야간, 주말/평일 등)
            time_period = ""
            if '주간' in name:
                time_period = "주간"
            elif '야간' in name:
                time_period = "야간"
            elif '주말' in name or '공휴일' in name:
                time_period = "주말/공휴일"
            elif '평일' in name:
                time_period = "평일"
                
            # 상세 정보 추출
            details = item.find_all('p') or item.find_all('span')
            detail_text = " ".join([d.get_text(strip=True) for d in details])
            
            # 이용대상 추출
            target_match = re.search(r'이용대상[:\s]*([^접수기간]+)', detail_text)
            target = target_match.group(1).strip() if target_match else "제한없음"
            
            # 접수기간 추출
            period_match = re.search(r'접수기간[:\s]*([^이용기간]+)', detail_text)
            period = period_match.group(1).strip() if period_match else ""
            
            # 이용기간 추출
            use_period_match = re.search(r'이용기간[:\s]*([^상세보기]+)', detail_text)
            use_period = use_period_match.group(1).strip() if use_period_match else ""
            
            # 예약 방법 추출
            reservation_method = "온라인"
            if '전화' in detail_text:
                reservation_method = "전화"
            elif '현장' in detail_text:
                reservation_method = "현장"
                
            # 요금 정보 추출
            fee_info = "유료"
            if '무료' in detail_text:
                fee_info = "무료"
                
            court_info = {
                'name': name,
                'region': region,
                'court_number': court_number,
                'time_period': time_period,
                'target': target,
                'reservation_period': period,
                'use_period': use_period,
                'reservation_method': reservation_method,
                'fee_info': fee_info,
                'detail_text': detail_text
            }
            
            return court_info
            
        except Exception as e:
            print(f"파싱 오류: {e}")
            return None
            
    def handle_pagination(self, soup):
        """페이지네이션을 처리합니다."""
        # 페이지 번호 찾기
        pagination = soup.find('div', class_='pagination') or soup.find('nav', class_='pagination')
        if pagination:
            page_links = pagination.find_all('a')
            for link in page_links:
                if link.get_text(strip=True).isdigit():
                    page_num = int(link.get_text(strip=True))
                    if page_num > 1:  # 첫 페이지는 이미 처리됨
                        self.scrape_page(page_num)
                        
    def scrape_page(self, page_num):
        """특정 페이지를 스크래핑합니다."""
        try:
            search_url = "https://yeyak.seoul.go.kr/web/search/selectPageListDetailSearchImg.do"
            params = {
                'code': 'T100',
                'dCode': 'T108',
                'pageIndex': page_num,
                'pageSize': 1000
            }
            
            response = self.session.get(search_url, params=params)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            self.extract_tennis_courts(soup)
            
            time.sleep(1)  # 요청 간격 조절
            
        except Exception as e:
            print(f"페이지 {page_num} 스크래핑 오류: {e}")
            
    def clean_and_organize_data(self):
        """데이터를 정리하고 조직화합니다."""
        print("데이터 정리 중...")
        
        # 중복 제거 및 정리
        unique_courts = {}
        
        for court in self.tennis_courts:
            # 기본 키 생성 (이름 + 지역)
            key = f"{court['name']}_{court['region']}"
            
            if key not in unique_courts:
                unique_courts[key] = court
            else:
                # 기존 데이터와 병합 (코트 번호가 다른 경우)
                existing = unique_courts[key]
                if court['court_number'] and court['court_number'] != existing['court_number']:
                    # 여러 코트가 있는 경우
                    if 'courts' not in existing:
                        existing['courts'] = [existing['court_number']]
                    if court['court_number'] not in existing['courts']:
                        existing['courts'].append(court['court_number'])
                        
        self.tennis_courts = list(unique_courts.values())
        
    def save_to_json(self, filename='seoul_tennis_courts.json'):
        """JSON 파일로 저장합니다."""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.tennis_courts, f, ensure_ascii=False, indent=2)
        print(f"JSON 파일 저장 완료: {filename}")
        
    def save_to_csv(self, filename='seoul_tennis_courts.csv'):
        """CSV 파일로 저장합니다."""
        df = pd.DataFrame(self.tennis_courts)
        df.to_csv(filename, index=False, encoding='utf-8-sig')
        print(f"CSV 파일 저장 완료: {filename}")
        
    def generate_summary(self):
        """데이터 요약 정보를 생성합니다."""
        print("\n=== 서울특별시 테니스장 데이터 요약 ===")
        print(f"총 테니스장 수: {len(self.tennis_courts)}")
        
        # 지역별 통계
        regions = {}
        for court in self.tennis_courts:
            region = court['region']
            regions[region] = regions.get(region, 0) + 1
            
        print("\n지역별 테니스장 수:")
        for region, count in sorted(regions.items()):
            print(f"  {region}: {count}개")
            
        # 시간대별 통계
        time_periods = {}
        for court in self.tennis_courts:
            period = court['time_period'] or "미분류"
            time_periods[period] = time_periods.get(period, 0) + 1
            
        print("\n시간대별 분포:")
        for period, count in sorted(time_periods.items()):
            print(f"  {period}: {count}개")

def main():
    scraper = SeoulTennisScraper()
    
    # 데이터 수집
    scraper.scrape_tennis_courts()
    
    # 데이터 정리
    scraper.clean_and_organize_data()
    
    # 요약 정보 출력
    scraper.generate_summary()
    
    # 파일 저장
    scraper.save_to_json()
    scraper.save_to_csv()
    
    print("\n스크래핑 완료!")

if __name__ == "__main__":
    main()
