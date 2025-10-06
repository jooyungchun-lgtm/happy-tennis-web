'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/lib/auth';
import { ChatRoom, Membership } from '@/types/models';
import { formatDate, formatTime } from '@/lib/utils';
import { 
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const ChatView: React.FC = () => {
  const { userProfile } = useAuth();
  const [activeChatRooms, setActiveChatRooms] = useState<ChatRoom[]>([]);
  const [memberships, setMemberships] = useState<Record<string, Membership>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const loadActiveChatRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      if (!userProfile) return;

      const [rooms, userMemberships] = await Promise.all([
        authService.fetchChatRooms(),
        authService.fetchUserMemberships(userProfile.id)
      ]);

      setMemberships(userMemberships);

      // 참여 중인 채팅방 필터링
      const active = rooms.filter(room => 
        room.id && userMemberships[room.id as string]?.isParticipating
      );
      setActiveChatRooms(active);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  useEffect(() => {
    loadActiveChatRooms();
  }, [userProfile, loadActiveChatRooms]);

  if (loading) {
    return (
      <div className="flex-1 overflow-hidden">
        <div className="p-4 space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 animate-pulse">
              <div className="h-4 bg-white/20 rounded mb-2"></div>
              <div className="h-3 bg-white/10 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-white mb-2">오류가 발생했습니다</h3>
          <p className="text-red-200 mb-4">{error}</p>
          <button
            onClick={loadActiveChatRooms}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <h1 className="text-2xl font-bold text-white">내 채팅방</h1>
        <p className="text-white/70 text-sm mt-1">
          참여 중인 채팅방 {activeChatRooms.length}개
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeChatRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <ChatBubbleLeftRightIcon className="h-16 w-16 text-white/30 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              참여 중인 채팅방이 없습니다
            </h3>
            <p className="text-white/60 mb-6">
              홈에서 채팅방에 참여해보세요!
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {activeChatRooms.map((room) => {
              const membership = memberships[room.id || ''];
              const isConfirmed = membership?.isConfirmed || false;

              return (
                <div
                  key={room.id}
                  onClick={() => window.location.href = `/chat/${room.id}`}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">
                        {room.courtName} {room.courtNumber}번
                      </h3>
                      <p className="text-white/70 text-sm">
                        {formatDate(room.date)} {formatTime(room.startTime)} - {formatTime(room.endTime)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        room.status === '마감' 
                          ? 'bg-red-500/20 text-red-400' 
                          : 'bg-cyan-500/20 text-cyan-400'
                      }`}>
                        {room.status}
                      </span>
                      {isConfirmed && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                          확정
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-white/70">
                    <div className="flex items-center space-x-4">
                      <span>{room.gameType}</span>
                      <span>NTRP {room.ntrp}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-white/60">
                      <ClockIcon className="h-4 w-4" />
                      <span>
                        {room.startTime > new Date() 
                          ? `${Math.ceil((room.startTime.getTime() - new Date().getTime()) / (1000 * 60 * 60))}시간 후`
                          : '진행 중'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatView;
