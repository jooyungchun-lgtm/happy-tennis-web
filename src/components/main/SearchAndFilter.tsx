'use client';

import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { ChatRoom } from '@/types/models';

interface SearchAndFilterProps {
  chatRooms: ChatRoom[];
  onFilteredRooms: (rooms: ChatRoom[]) => void;
}

export default function SearchAndFilter({ chatRooms, onFilteredRooms }: SearchAndFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNtrp, setSelectedNtrp] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedGameType, setSelectedGameType] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const ntrpLevels = ['1.0', '1.5', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0'];
  const regions = ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];
  const gameTypes = ['남자 단식', '여자 단식', '남자 복식', '여자 복식', '혼합 복식'];

  // 필터링 로직
  const applyFilters = () => {
    let filtered = chatRooms;

    // 검색어 필터
    if (searchTerm) {
      filtered = filtered.filter(room =>
        room.courtName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.gameType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // NTRP 레벨 필터
    if (selectedNtrp) {
      const ntrpValue = parseFloat(selectedNtrp);
      filtered = filtered.filter(room => room.ntrp === ntrpValue);
    }

    // 지역 필터
    if (selectedRegion) {
      filtered = filtered.filter(room =>
        room.courtName.includes(selectedRegion)
      );
    }

    // 날짜 필터
    if (selectedDate) {
      const selectedDateObj = new Date(selectedDate);
      filtered = filtered.filter(room => {
        const roomDate = new Date(room.date);
        return roomDate.toDateString() === selectedDateObj.toDateString();
      });
    }

    // 게임 타입 필터
    if (selectedGameType) {
      filtered = filtered.filter(room => room.gameType === selectedGameType);
    }

    onFilteredRooms(filtered);
  };

  // 필터 초기화
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedNtrp('');
    setSelectedRegion('');
    setSelectedDate('');
    setSelectedGameType('');
    onFilteredRooms(chatRooms);
  };

  // 필터 변경 시 자동 적용
  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedNtrp, selectedRegion, selectedDate, selectedGameType, chatRooms]);

  return (
    <div className="bg-white/5 border-b border-white/10 p-4">
      {/* 검색 바 */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
          <input
            type="text"
            placeholder="코트명 또는 게임 타입으로 검색..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              applyFilters();
            }}
            className="w-full pl-10 pr-4 py-3 bg-white/10 text-white placeholder-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white/20 transition-colors"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-3 rounded-lg transition-colors ${
            showFilters 
              ? 'bg-cyan-600 text-white' 
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <FunnelIcon className="w-5 h-5" />
        </button>
      </div>

      {/* 필터 옵션 */}
      {showFilters && (
        <div className="space-y-4">
          {/* NTRP 레벨 필터 */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              NTRP 레벨
            </label>
            <select
              value={selectedNtrp}
              onChange={(e) => {
                setSelectedNtrp(e.target.value);
                applyFilters();
              }}
              className="w-full px-3 py-2 bg-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">전체</option>
              {ntrpLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          {/* 지역 필터 */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              지역
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                applyFilters();
              }}
              className="w-full px-3 py-2 bg-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">전체</option>
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          {/* 날짜 필터 */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              날짜
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                applyFilters();
              }}
              className="w-full px-3 py-2 bg-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* 게임 타입 필터 */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              게임 타입
            </label>
            <select
              value={selectedGameType}
              onChange={(e) => {
                setSelectedGameType(e.target.value);
                applyFilters();
              }}
              className="w-full px-3 py-2 bg-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">전체</option>
              {gameTypes.map(gameType => (
                <option key={gameType} value={gameType}>{gameType}</option>
              ))}
            </select>
          </div>

          {/* 필터 초기화 */}
          <div className="flex justify-end">
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-white/80 hover:text-white transition-colors"
            >
              필터 초기화
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
