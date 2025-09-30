'use client';

import { ChatMessage } from '@/types/models';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ChatMessageComponentProps {
  message: ChatMessage;
  isOwn: boolean;
}

export default function ChatMessageComponent({ message, isOwn }: ChatMessageComponentProps) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
        isOwn 
          ? 'bg-cyan-600 text-white' 
          : 'bg-white/10 text-white backdrop-blur-sm'
      }`}>
        <div className="flex flex-col">
          {!isOwn && (
            <p className="text-xs text-white/60 mb-1">{message.senderName}</p>
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
      </div>
    </div>
  );
}
