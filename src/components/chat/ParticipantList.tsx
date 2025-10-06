'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AuthService } from '@/lib/auth';
// import { UserProfile } from '@/types/models';
import { 
  UserIcon, 
  CheckIcon, 
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Participant {
  id: string;
  name: string;
  gender: string;
  isHost: boolean;
  isConfirmed: boolean;
  role: string;
  ntrp: number;
  experience: number;
  ageGroup: string;
  homeCourt: string;
}

interface ParticipantListProps {
  roomId: string;
  currentUserId: string;
  isHost: boolean;
  onParticipantUpdate: () => void;
}

const authService = AuthService.getInstance();

export default function ParticipantList({ roomId, currentUserId, isHost, onParticipantUpdate }: ParticipantListProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadParticipants = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const participantsSnapshot = await authService.getParticipants(roomId);
      setParticipants(participantsSnapshot);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '참여자 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  const handleConfirmParticipant = async (participantId: string) => {
    try {
      await authService.confirmParticipant(roomId, participantId);
      await loadParticipants();
      onParticipantUpdate();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '참여자 승인에 실패했습니다.');
    }
  };

  const handleRejectParticipant = async (participantId: string) => {
    try {
      await authService.rejectParticipant(roomId, participantId);
      await loadParticipants();
      onParticipantUpdate();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '참여자 거부에 실패했습니다.');
    }
  };

  const handleKickParticipant = async (participantId: string) => {
    if (!confirm('정말로 이 참여자를 추방하시겠습니까?')) {
      return;
    }
    
    try {
      await authService.kickParticipant(roomId, participantId);
      await loadParticipants();
      onParticipantUpdate();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '참여자 추방에 실패했습니다.');
    }
  };

  useEffect(() => {
    loadParticipants();
  }, [roomId, loadParticipants]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-white/10 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-center">
          <ExclamationTriangleIcon className="h-8 w-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold text-white mb-4">참여자 목록</h3>
      <div className="space-y-3">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white">{participant.name}</span>
                    {participant.isHost && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                        호스트
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-white/70">
                    {participant.gender} • NTRP {participant.ntrp} • {participant.ageGroup}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {participant.isConfirmed ? (
                  <span className="flex items-center space-x-1 text-green-400">
                    <CheckIcon className="w-4 h-4" />
                    <span className="text-sm">확정</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 text-yellow-400">
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    <span className="text-sm">대기중</span>
                  </span>
                )}
                
                {isHost && !participant.isHost && (
                  <div className="flex space-x-1">
                    {!participant.isConfirmed && (
                      <>
                        <button
                          onClick={() => handleConfirmParticipant(participant.id)}
                          className="p-1 text-green-400 hover:bg-green-400/20 rounded transition-colors"
                          title="승인"
                        >
                          <CheckIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRejectParticipant(participant.id)}
                          className="p-1 text-red-400 hover:bg-red-400/20 rounded transition-colors"
                          title="거부"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleKickParticipant(participant.id)}
                      className="p-1 text-red-400 hover:bg-red-400/20 rounded transition-colors"
                      title="추방"
                    >
                      <ExclamationTriangleIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
