'use client';

import { useState } from 'react';
import { ChatMessage } from '@/types/models';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { moderationService } from '@/lib/moderation';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';

interface ChatMessageComponentProps {
  message: ChatMessage;
  isOwn: boolean;
  currentUserId: string;
  roomId: string;
}

export default function ChatMessageComponent({ message, isOwn, currentUserId, roomId }: ChatMessageComponentProps) {
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const handleReportMessage = async () => {
    if (!reportReason.trim()) return;
    
    try {
      await moderationService.reportMessage(currentUserId, message.id || '', reportReason, roomId);
      alert('메시지가 신고되었습니다.');
      setShowReportMenu(false);
      setReportReason('');
    } catch (error) {
      console.error('Report message error:', error);
      alert('신고 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl relative ${
        isOwn 
          ? 'bg-cyan-600 text-white' 
          : 'bg-white/10 text-white backdrop-blur-sm'
      }`}>
        <div className="flex flex-col">
          {!isOwn && (
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-white/60">{message.senderName}</p>
              <button
                onClick={() => setShowReportMenu(!showReportMenu)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/20 rounded"
              >
                <EllipsisVerticalIcon className="w-3 h-3 text-white/60" />
              </button>
            </div>
          )}
          <p className="text-sm break-words">{message.content}</p>
          <p className={`text-xs mt-1 ${
            isOwn ? 'text-cyan-100' : 'text-white/60'
          }`}>
            {formatDistanceToNow(message.timestamp, { 
              addSuffix: true, 
              locale: ko 
            })}
          </p>
        </div>

        {/* 신고 메뉴 */}
        {showReportMenu && !isOwn && (
          <div className="absolute top-full right-0 mt-2 bg-white/20 backdrop-blur-lg rounded-lg p-3 min-w-[200px] border border-white/30">
            <h4 className="text-sm font-semibold text-white mb-2">메시지 신고</h4>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full px-2 py-1 bg-white/10 text-white text-sm rounded mb-2"
            >
              <option value="">신고 사유를 선택하세요</option>
              <option value="spam">스팸</option>
              <option value="inappropriate">부적절한 내용</option>
              <option value="harassment">괴롭힘</option>
              <option value="other">기타</option>
            </select>
            <div className="flex space-x-2">
              <button
                onClick={handleReportMessage}
                disabled={!reportReason}
                className="flex-1 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                신고
              </button>
              <button
                onClick={() => setShowReportMenu(false)}
                className="px-3 py-1 bg-white/20 text-white text-sm rounded hover:bg-white/30"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
