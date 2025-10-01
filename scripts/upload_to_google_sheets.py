#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import requests
import sys
import os

def upload_to_google_sheets():
    """로컬 JSON 데이터를 구글 시트에 업로드합니다."""
    
    # JSON 파일 경로
    json_file_path = 'scraper/seoul_tennis_courts_manual.json'
    
    if not os.path.exists(json_file_path):
        print(f"JSON 파일을 찾을 수 없습니다: {json_file_path}")
        return False
    
    # JSON 데이터 읽기
    with open(json_file_path, 'r', encoding='utf-8') as f:
        courts_data = json.load(f)
    
    print(f"로드된 테니스장 데이터: {len(courts_data)}개")
    
    # API 엔드포인트 (로컬 개발 서버)
    api_url = "http://localhost:3000/api/tennis-courts"
    
    try:
        # API로 데이터 업로드
        response = requests.post(
            api_url,
            json={"courts": courts_data},
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print(f"✅ 구글 시트 업로드 성공: {result.get('message')}")
                return True
            else:
                print(f"❌ 업로드 실패: {result.get('error')}")
                return False
        else:
            print(f"❌ HTTP 오류: {response.status_code}")
            print(f"응답: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ 연결 오류: 로컬 서버가 실행 중인지 확인해주세요.")
        print("   npm run dev 명령으로 개발 서버를 시작하세요.")
        return False
    except requests.exceptions.Timeout:
        print("❌ 타임아웃: 요청이 너무 오래 걸렸습니다.")
        return False
    except Exception as e:
        print(f"❌ 예상치 못한 오류: {e}")
        return False

def main():
    print("🚀 구글 시트 업로드 시작...")
    
    success = upload_to_google_sheets()
    
    if success:
        print("\n🎉 업로드 완료!")
        print("구글 시트에서 데이터를 확인해보세요:")
        print("https://docs.google.com/spreadsheets/d/1hOJiNMx1Uve6hjkgoBXtvLWPERdpjSZQFiHjQYh4rUw/edit")
    else:
        print("\n💥 업로드 실패!")
        sys.exit(1)

if __name__ == "__main__":
    main()
