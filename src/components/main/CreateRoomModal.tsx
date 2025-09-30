'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/lib/auth';
import { CreateRoomForm, ChatRoom } from '@/types/models';
import Button from '@/components/ui/Button';
import { XMarkIcon } from '@heroicons/react/24/outline';

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

      await authService.createChatRoom(room, userProfile);
      onRoomCreated();
      onClose();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                테니스장
              </label>
              <input
                name="courtName"
                type="text"
                required
                value={formData.courtName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/95 text-gray-900 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="테니스장 이름"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                코트 번호
              </label>
              <input
                name="courtNumber"
                type="text"
                required
                value={formData.courtNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/95 text-gray-900 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="1"
              />
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
