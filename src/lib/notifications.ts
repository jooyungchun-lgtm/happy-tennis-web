// 브라우저 알림 관리
export class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // 알림 권한 요청
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('이 브라우저는 알림을 지원하지 않습니다.');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission === 'denied') {
      console.warn('알림이 차단되었습니다.');
      return false;
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    return permission === 'granted';
  }

  // 새 메시지 알림
  showNewMessageNotification(senderName: string, message: string, roomName: string) {
    if (this.permission !== 'granted') return;

    const notification = new Notification(`${roomName} - 새 메시지`, {
      body: `${senderName}: ${message}`,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'new-message',
      requireInteraction: false,
      silent: false
    });

    // 알림 클릭 시 해당 채팅방으로 이동
    notification.onclick = () => {
      window.focus();
      // 채팅방 URL로 이동 (roomId는 별도로 전달받아야 함)
      notification.close();
    };

    // 5초 후 자동 닫기
    setTimeout(() => {
      notification.close();
    }, 5000);
  }

  // 채팅방 참여 알림
  showJoinNotification(roomName: string) {
    if (this.permission !== 'granted') return;

    const notification = new Notification('채팅방 참여', {
      body: `${roomName}에 참여했습니다.`,
      icon: '/icon-192.png',
      tag: 'room-join',
      requireInteraction: false
    });

    setTimeout(() => {
      notification.close();
    }, 3000);
  }

  // 알림 권한 상태 확인
  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  // 채팅방 참여자 변경 알림
  showParticipantChangeNotification(changeType: 'joined' | 'left' | 'kicked', participantName: string, roomName: string) {
    if (this.permission !== 'granted') return;

    const messages = {
      joined: `${participantName}님이 ${roomName}에 참여했습니다.`,
      left: `${participantName}님이 ${roomName}에서 나갔습니다.`,
      kicked: `${participantName}님이 ${roomName}에서 추방되었습니다.`
    };

    const notification = new Notification('참여자 변경', {
      body: messages[changeType],
      icon: '/icon-192.png',
      tag: 'participant-change',
      requireInteraction: false
    });

    setTimeout(() => {
      notification.close();
    }, 4000);
  }

  // 채팅방 마감 알림
  showRoomClosedNotification(roomName: string) {
    if (this.permission !== 'granted') return;

    const notification = new Notification('채팅방 마감', {
      body: `${roomName}이 마감되었습니다.`,
      icon: '/icon-192.png',
      tag: 'room-closed',
      requireInteraction: true
    });

    setTimeout(() => {
      notification.close();
    }, 5000);
  }

  // 경기 일정 알림
  showGameReminderNotification(roomName: string, timeUntil: string) {
    if (this.permission !== 'granted') return;

    const notification = new Notification('경기 일정 알림', {
      body: `${roomName} 경기가 ${timeUntil} 후에 시작됩니다.`,
      icon: '/icon-192.png',
      tag: 'game-reminder',
      requireInteraction: false
    });

    setTimeout(() => {
      notification.close();
    }, 6000);
  }

  // 알림 설정 초기화
  init() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }
}

export const notificationService = NotificationService.getInstance();
