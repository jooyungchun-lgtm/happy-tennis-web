'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/lib/auth';
import { ChatRoom, Membership } from '@/types/models';
import { formatDate, formatTime, getTimeUntil } from '@/lib/utils';
import Button from '@/components/ui/Button';
import SearchAndFilter from './SearchAndFilter';
import TennisCourtsAdmin from '@/components/admin/TennisCourtsAdmin';
import { ChatRoomSkeleton } from '@/components/shared/SkeletonLoader';
import { 
  CircleStackIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const MainView: React.FC = () => {
  const { userProfile } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [filteredChatRooms, setFilteredChatRooms] = useState<ChatRoom[]>([]);
  const [memberships, setMemberships] = useState<Record<string, Membership>>({});
  const [participantCounts, setParticipantCounts] = useState<Record<string, { male: number; female: number }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeChatRooms, setActiveChatRooms] = useState<ChatRoom[]>([]);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [rooms, userMemberships] = await Promise.all([
        authService.fetchChatRooms(),
        userProfile ? authService.fetchUserMemberships(userProfile.id) : Promise.resolve({} as Record<string, Membership>)
      ]);

      setChatRooms(rooms);
      setFilteredChatRooms(rooms);
      setMemberships(userMemberships);

      // 참여 중인 채팅방 필터링
      const active = rooms.filter(room => 
        room.id && userMemberships[room.id as string]?.isParticipating
      );
      setActiveChatRooms(active);

      // 각 채팅방의 참여자 수 가져오기
      const counts: Record<string, { male: number; female: number }> = {};
      for (const room of rooms) {
        if (room.id) {
          const count = await authService.participantCounts(room.id);
          counts[room.id] = count;
        }
      }
      setParticipantCounts(counts);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  useEffect(() => {
    loadData();

    // 채팅방 생성 이벤트 리스너
    const handleRoomCreated = () => {
      loadData();
    };

    window.addEventListener('roomCreated', handleRoomCreated);
    return () => {
      window.removeEventListener('roomCreated', handleRoomCreated);
    };
  }, [loadData]);

  const handleJoinRoom = async (room: ChatRoom) => {
    if (!userProfile || !room.id) return;

    try {
      console.log('Attempting to join room from main view:', { roomId: room.id, userId: userProfile.id });
      await authService.joinChatRoom(room.id, userProfile);
      await loadData(); // 데이터 새로고침
      console.log('Successfully joined room from main view');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '채팅방 참여에 실패했습니다.';
      console.error('Join room error:', errorMessage);
      
      // 이미 참여 중인 경우에는 에러를 표시하지 않고 데이터 새로고침
      if (errorMessage.includes('이미 참여 중인 채팅방')) {
        await loadData();
      } else {
        setError(errorMessage);
      }
    }
  };

  const getPersonalStatus = (roomId: string) => {
    const membership = memberships[roomId as string];
    if (!membership) return 'none';
    if (membership.isParticipating) {
      return membership.isConfirmed ? 'confirmed' : 'pending';
    }
    return 'none';
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-hidden">
        <div className="p-4 space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <ChatRoomSkeleton key={index} />
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
          <Button onClick={loadData} variant="outline">
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden">
      {/* 관리자 패널 버튼 */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">테니스 채팅방</h1>
          <Button
            onClick={() => setShowAdminPanel(true)}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Cog6ToothIcon className="h-4 w-4" />
            <span>테니스장 관리</span>
          </Button>
        </div>
      </div>

      {/* 검색 및 필터링 */}
      <SearchAndFilter 
        chatRooms={chatRooms} 
        onFilteredRooms={setFilteredChatRooms} 
      />
      
      {/* 참여 중인 채팅방 섹션 */}
      {activeChatRooms.length > 0 && (
        <div className="bg-white/5 border-b border-white/10 p-4">
          <h2 className="text-lg font-semibold text-white mb-3">참여 중인 채팅방</h2>
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {activeChatRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => window.location.href = `/chat/${room.id}`}
                className="flex-shrink-0 bg-white/10 backdrop-blur-lg rounded-xl p-4 min-w-[200px] border border-white/20 cursor-pointer hover:bg-white/20 transition-colors"
              >
                <h3 className="font-semibold text-white text-sm">
                  {room.courtName} {room.courtNumber}번
                </h3>
                <div className="mt-2">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    room.status === '마감' 
                      ? 'bg-red-500/20 text-red-400' 
                      : 'bg-cyan-500/20 text-cyan-400'
                  }`}>
                    {room.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 채팅방 목록 */}
      <div className="flex-1 overflow-y-auto">
        {filteredChatRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <CircleStackIcon className="h-16 w-16 text-white/30 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              아직 개설된 채팅방이 없습니다
            </h3>
            <p className="text-white/60 mb-6">
              새로운 채팅방을 만들어보세요!
            </p>
            <Button className="flex items-center space-x-2">
              <PlusIcon className="h-5 w-5" />
              <span>채팅방 만들기</span>
            </Button>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {filteredChatRooms.map((room) => {
              const status = getPersonalStatus(room.id || '');
              const counts = participantCounts[room.id as string] || { male: 0, female: 0 };
              const isParticipating = status !== 'none';

              return (
                <div
                  key={room.id}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
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
                      <span className="text-white/60 text-sm">
                        {getTimeUntil(room.startTime)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-white/70 mb-4">
                    <div className="flex items-center space-x-4">
                      <span>{room.gameType}</span>
                      <span>NTRP {room.ntrp}</span>
                      <span>
                        남성 {counts.male}/{room.maleCount} | 여성 {counts.female}/{room.femaleCount}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-white/60">
                      {isParticipating ? (
                        <span className="text-green-400">
                          {status === 'confirmed' ? '참여 확정' : '참여 대기중'}
                        </span>
                      ) : (
                        <span>참여 가능</span>
                      )}
                    </div>
                    
                    {!isParticipating && !room.isClosed && (
                      <Button
                        size="sm"
                        onClick={() => handleJoinRoom(room)}
                        disabled={room.isFinished}
                      >
                        참여하기
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 관리자 패널 */}
      <TennisCourtsAdmin
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
      />
    </div>
  );
};

export default MainView;
