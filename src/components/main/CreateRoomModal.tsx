'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/lib/auth';
import { tennisCourtsService, TennisCourt } from '@/lib/tennisCourts';
import { CreateRoomForm, ChatRoom } from '@/types/models';
import Button from '@/components/ui/Button';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomCreated: () => void;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onRoomCreated
}) => {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [formData, setFormData] = useState<CreateRoomForm>({
    courtName: '',
    courtNumber: '',
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2시간 후
    gameType: '남자 단식',
    ntrp: 3.0,
    maleCount: 2,
    femaleCount: 0
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  // 테니스장 관련 상태
  const [tennisCourts, setTennisCourts] = useState<TennisCourt[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCourtSelector, setShowCourtSelector] = useState<boolean>(false);

  // 테니스장 데이터 로드
  useEffect(() => {
    const loadTennisCourts = async () => {
      try {
        const courts = tennisCourtsService.getAllCourts();
        setTennisCourts(courts);
      } catch (error) {
        console.error('테니스장 데이터 로드 실패:', error);
      }
    };

    loadTennisCourts();
  }, []);

  // 필터링된 테니스장 목록
  const filteredCourts = tennisCourts.filter(court => {
    const matchesRegion = !selectedRegion || court.region === selectedRegion;
    const matchesSearch = !searchQuery || 
      court.facility_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      court.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesRegion && matchesSearch;
  });

  // 테니스장 선택 핸들러
  const handleCourtSelect = (court: TennisCourt) => {
    setFormData(prev => ({
      ...prev,
      courtName: court.facility_name,
      courtNumber: court.court_number
    }));
    setShowCourtSelector(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    setError('');
    setIsLoading(true);

    try {
      // 날짜와 시간을 결합
      const startDateTime = new Date(formData.date);
      startDateTime.setHours(formData.startTime.getHours(), formData.startTime.getMinutes());

      const endDateTime = new Date(formData.date);
      endDateTime.setHours(formData.endTime.getHours(), formData.endTime.getMinutes());

      const room: ChatRoom = {
        courtName: formData.courtName,
        courtNumber: formData.courtNumber,
        date: formData.date,
        startTime: startDateTime,
        endTime: endDateTime,
        gameType: formData.gameType,
        ntrp: formData.ntrp,
        maleCount: formData.maleCount,
        femaleCount: formData.femaleCount,
        hostId: userProfile.id,
        bannedUserIds: [],
        status: '모집중',
        isClosed: false,
        isFinished: false
      };

      const roomId = await authService.createChatRoom(room, userProfile);
      console.log('Chat room created with ID:', roomId);
      
      onRoomCreated();
      onClose();
      
      // 생성된 채팅방으로 자동 이동
      router.push(`/chat/${roomId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '채팅방 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: new Date(value)
    }));
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const [hours, minutes] = value.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
  };

  // 모달 외부 클릭 시 테니스장 선택기 닫기
  const handleModalClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowCourtSelector(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleModalClick}
    >
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 w-full max-w-md border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">새 채팅방 만들기</h2>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* 테니스장 선택 */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              테니스장 선택
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCourtSelector(!showCourtSelector)}
                className="w-full px-4 py-3 bg-white/95 text-gray-900 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-left flex items-center justify-between"
              >
                <span>
                  {formData.courtName && formData.courtNumber 
                    ? `${formData.courtName} - ${formData.courtNumber}`
                    : '테니스장을 선택해주세요'
                  }
                </span>
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </button>
              
              {showCourtSelector && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-300 shadow-lg z-50 max-h-80 overflow-y-auto">
                  {/* 검색 및 필터 */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="테니스장 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <select
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">전체 지역</option>
                        {tennisCourtsService.getRegions().map(region => (
                          <option key={region} value={region}>{region}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* 테니스장 목록 */}
                  <div className="max-h-60 overflow-y-auto">
                    {filteredCourts.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        검색 결과가 없습니다.
                      </div>
                    ) : (
                      filteredCourts.map((court, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleCourtSelect(court)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">
                            {court.facility_name} - {court.court_number}
                          </div>
                          <div className="text-sm text-gray-500">
                            {court.region} | {court.time_period} | {court.fee_info}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {court.address}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              날짜
            </label>
            <input
              name="date"
              type="date"
              required
              value={formData.date.toISOString().split('T')[0]}
              onChange={handleDateChange}
              className="w-full px-4 py-3 bg-white/95 text-gray-900 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                시작 시간
              </label>
              <input
                name="startTime"
                type="time"
                required
                value={formData.startTime.toTimeString().slice(0, 5)}
                onChange={handleTimeChange}
                className="w-full px-4 py-3 bg-white/95 text-gray-900 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                종료 시간
              </label>
              <input
                name="endTime"
                type="time"
                required
                value={formData.endTime.toTimeString().slice(0, 5)}
                onChange={handleTimeChange}
                className="w-full px-4 py-3 bg-white/95 text-gray-900 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              경기 종류
            </label>
            <select
              name="gameType"
              value={formData.gameType}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/95 text-gray-900 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="남자 단식">남자 단식</option>
              <option value="여자 단식">여자 단식</option>
              <option value="남자 복식">남자 복식</option>
              <option value="여자 복식">여자 복식</option>
              <option value="혼합 복식">혼합 복식</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              NTRP 레벨: {formData.ntrp}
            </label>
            <input
              name="ntrp"
              type="range"
              min="1.0"
              max="7.0"
              step="0.5"
              value={formData.ntrp}
              onChange={handleChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-white/60 mt-1">
              <span>1.0 (초보)</span>
              <span>7.0 (프로)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                남성 인원
              </label>
              <input
                name="maleCount"
                type="number"
                min="0"
                max="10"
                required
                value={formData.maleCount}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/95 text-gray-900 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                여성 인원
              </label>
              <input
                name="femaleCount"
                type="number"
                min="0"
                max="10"
                required
                value={formData.femaleCount}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/95 text-gray-900 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1"
              loading={isLoading}
              disabled={isLoading}
            >
              만들기
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;
