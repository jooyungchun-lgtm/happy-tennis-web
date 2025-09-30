import { useState, useEffect } from 'react';
import { onSnapshot, query, collection, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ChatMessage } from '@/types/models';

export function useRealtimeChat(roomId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const messagesRef = collection(db, 'chatRooms', roomId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newMessages: ChatMessage[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          newMessages.push({
            id: doc.id,
            roomId: roomId,
            senderId: data.senderId,
            senderName: data.senderName,
            content: data.content,
            timestamp: data.timestamp?.toDate() || new Date(),
            messageType: data.messageType || 'text'
          });
        });
        setMessages(newMessages);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Realtime chat error:', err);
        setError('실시간 채팅을 불러올 수 없습니다.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [roomId]);

  return { messages, loading, error };
}
