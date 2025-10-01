#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
from bs4 import BeautifulSoup
import json
import time
import re
from urllib.parse import urljoin, urlparse
import pandas as pd

class SeoulTennisScraperV2:
    def __init__(self):
        self.base_url = "https://yeyak.seoul.go.kr"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        })
        self.tennis_courts = []
        
    def scrape_tennis_courts(self):
        """테니스장 목록을 스크래핑합니다."""
        print("서울특별시 공공서비스예약 테니스장 데이터 수집 시작...")
        
        # 직접 테니스장 검색 페이지 접근
        search_url = "https://yeyak.seoul.go.kr/web/search/selectPageListDetailSearchImg.do"
        
        # POST 요청으로 검색
        data = {
            'code': 'T100',
            'dCode': 'T108',
            'searchCondition': 'tennis',
            'searchKeyword': '',
            'pageIndex': 1,
            'pageSize': 1000
        }
        
        try:
            response = self.session.post(search_url, data=data)
            response.raise_for_status()
            
            print(f"응답 상태 코드: {response.status_code}")
            print(f"응답 내용 길이: {len(response.content)}")
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # 페이지 구조 분석
            self.analyze_page_structure(soup)
            
            # 테니스장 목록 추출
            self.extract_tennis_courts(soup)
            
        except Exception as e:
            print(f"스크래핑 중 오류 발생: {e}")
            
    def analyze_page_structure(self, soup):
        """페이지 구조를 분석합니다."""
        print("\n=== 페이지 구조 분석 ===")
        
        # 모든 div 태그 찾기
        divs = soup.find_all('div')
        print(f"총 div 태그 수: {len(divs)}")
        
        # 클래스가 있는 div들
        divs_with_class = [div for div in divs if div.get('class')]
        print(f"클래스가 있는 div 수: {len(divs_with_class)}")
        
        # 주요 클래스들 출력
        classes = set()
        for div in divs_with_class:
            classes.update(div.get('class', []))
        
        print("발견된 주요 클래스들:")
        for cls in sorted(classes):
            if any(keyword in cls.lower() for keyword in ['item', 'list', 'card', 'court', 'tennis']):
                print(f"  - {cls}")
                
        # 테니스 관련 텍스트 찾기
        tennis_texts = soup.find_all(text=re.compile(r'테니스', re.I))
        print(f"\n테니스 관련 텍스트 수: {len(tennis_texts)}")
        
        for i, text in enumerate(tennis_texts[:5]):  # 처음 5개만 출력
            print(f"  {i+1}. {text.strip()}")
            
    def extract_tennis_courts(self, soup):
        """HTML에서 테니스장 정보를 추출합니다."""
        print("\n=== 테니스장 정보 추출 ===")
        
        # 다양한 선택자로 테니스장 목록 찾기
        selectors = [
            'div.item',
            'div.list-item',
            'div.card',
            'div.result-item',
            'li.item',
            'li.list-item',
            '.item',
            '.list-item',
            '.card',
            '.result-item'
        ]
        
        for selector in selectors:
            items = soup.select(selector)
            if items:
                print(f"선택자 '{selector}'로 {len(items)}개 아이템 발견")
                
                for i, item in enumerate(items[:3]):  # 처음 3개만 분석
                    print(f"\n아이템 {i+1} 분석:")
                    print(f"  태그: {item.name}")
                    print(f"  클래스: {item.get('class', [])}")
                    print(f"  텍스트 미리보기: {item.get_text()[:100]}...")
                    
                    # 테니스 관련 내용이 있는지 확인
                    if '테니스' in item.get_text():
                        court_info = self.parse_court_item(item)
                        if court_info:
                            self.tennis_courts.append(court_info)
                            print(f"  ✓ 테니스장 추출 성공: {court_info['name']}")
                            
        # 텍스트 기반으로 직접 검색
        self.extract_from_text(soup)
        
    def extract_from_text(self, soup):
        """텍스트에서 직접 테니스장 정보를 추출합니다."""
        print("\n=== 텍스트 기반 추출 ===")
        
        # 모든 텍스트 가져오기
        full_text = soup.get_text()
        
        # 테니스장 패턴 찾기
        tennis_patterns = [
            r'([가-힣]+테니스장[^가-힣]*)',
            r'([가-힣]+한강공원[^가-힣]*테니스장[^가-힣]*)',
            r'([가-힣]+공원[^가-힣]*테니스장[^가-힣]*)'
        ]
        
        for pattern in tennis_patterns:
            matches = re.findall(pattern, full_text)
            print(f"패턴 '{pattern}' 매치 수: {len(matches)}")
            
            for match in matches[:10]:  # 처음 10개만 출력
                print(f"  - {match}")
                
                # 간단한 정보 추출
                court_info = {
                    'name': match.strip(),
                    'region': self.extract_region(match),
                    'court_number': self.extract_court_number(match),
                    'time_period': self.extract_time_period(match),
                    'target': '제한없음',
                    'reservation_period': '',
                    'use_period': '',
                    'reservation_method': '온라인',
                    'fee_info': '유료',
                    'detail_text': match
                }
                
                self.tennis_courts.append(court_info)
                
    def extract_region(self, text):
        """지역 정보를 추출합니다."""
        region_match = re.search(r'\(([^)]+)\)', text)
        return region_match.group(1) if region_match else ""
        
    def extract_court_number(self, text):
        """코트 번호를 추출합니다."""
        court_match = re.search(r'(\d+)번', text)
        return court_match.group(1) if court_match else ""
        
    def extract_time_period(self, text):
        """시간대를 추출합니다."""
        if '주간' in text:
            return "주간"
        elif '야간' in text:
            return "야간"
        elif '주말' in text or '공휴일' in text:
            return "주말/공휴일"
        elif '평일' in text:
            return "평일"
        return ""
        
    def parse_court_item(self, item):
        """개별 테니스장 아이템을 파싱합니다."""
        try:
            # 제목 찾기
            title_selectors = ['h3', 'h4', 'h5', 'strong', '.title', '.name']
            name = ""
            
            for selector in title_selectors:
                title_elem = item.select_one(selector)
                if title_elem:
                    name = title_elem.get_text(strip=True)
                    break
                    
            if not name:
                name = item.get_text(strip=True)[:50]  # 처음 50자만
                
            court_info = {
                'name': name,
                'region': self.extract_region(name),
                'court_number': self.extract_court_number(name),
                'time_period': self.extract_time_period(name),
                'target': '제한없음',
                'reservation_period': '',
                'use_period': '',
                'reservation_method': '온라인',
                'fee_info': '유료',
                'detail_text': item.get_text(strip=True)
            }
            
            return court_info
            
        except Exception as e:
            print(f"파싱 오류: {e}")
            return None
            
    def clean_and_organize_data(self):
        """데이터를 정리하고 조직화합니다."""
        print("데이터 정리 중...")
        
        # 중복 제거
        unique_courts = {}
        
        for court in self.tennis_courts:
            key = f"{court['name']}_{court['region']}"
            if key not in unique_courts:
                unique_courts[key] = court
                
        self.tennis_courts = list(unique_courts.values())
        
    def save_to_json(self, filename='seoul_tennis_courts_v2.json'):
        """JSON 파일로 저장합니다."""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.tennis_courts, f, ensure_ascii=False, indent=2)
        print(f"JSON 파일 저장 완료: {filename}")
        
    def save_to_csv(self, filename='seoul_tennis_courts_v2.csv'):
        """CSV 파일로 저장합니다."""
        df = pd.DataFrame(self.tennis_courts)
        df.to_csv(filename, index=False, encoding='utf-8-sig')
        print(f"CSV 파일 저장 완료: {filename}")
        
    def generate_summary(self):
        """데이터 요약 정보를 생성합니다."""
        print("\n=== 서울특별시 테니스장 데이터 요약 ===")
        print(f"총 테니스장 수: {len(self.tennis_courts)}")
        
        if self.tennis_courts:
            # 지역별 통계
            regions = {}
            for court in self.tennis_courts:
                region = court['region'] or "미분류"
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
                
            # 샘플 데이터 출력
            print("\n샘플 데이터 (처음 5개):")
            for i, court in enumerate(self.tennis_courts[:5]):
                print(f"  {i+1}. {court['name']} ({court['region']})")

def main():
    scraper = SeoulTennisScraperV2()
    
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
