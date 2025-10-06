// 콘텐츠 모더레이션 시스템
export class ModerationService {
  private static instance: ModerationService;
  private bannedWords: string[] = [
    '욕설', '비방', '스팸', '광고', '불법', '음란', '폭력', '혐오'
  ];

  private constructor() {}

  public static getInstance(): ModerationService {
    if (!ModerationService.instance) {
      ModerationService.instance = new ModerationService();
    }
    return ModerationService.instance;
  }

  // 메시지 필터링
  filterMessage(content: string): { isClean: boolean; filteredContent: string; violations: string[] } {
    const violations: string[] = [];
    let filteredContent = content;

    // 금지어 검사
    for (const word of this.bannedWords) {
      if (content.toLowerCase().includes(word.toLowerCase())) {
        violations.push(word);
        filteredContent = filteredContent.replace(new RegExp(word, 'gi'), '*'.repeat(word.length));
      }
    }

    // 스팸 패턴 검사 (연속된 동일 문자)
    if (/(.)\1{4,}/.test(content)) {
      violations.push('spam_pattern');
    }

    // URL 패턴 검사
    if (/https?:\/\/[^\s]+/.test(content)) {
      violations.push('url_detected');
    }

    return {
      isClean: violations.length === 0,
      filteredContent,
      violations
    };
  }

  // 사용자 신고 처리
  async reportUser(reporterId: string, reportedUserId: string, reason: string, roomId: string): Promise<void> {
    try {
      // 신고 데이터 저장 로직 (Firebase에 구현 필요)
      console.log('User reported:', { reporterId, reportedUserId, reason, roomId });
      
      // 관리자에게 알림 (실제 구현에서는 푸시 알림 또는 이메일)
      this.notifyAdmins({
        type: 'user_report',
        reporterId,
        reportedUserId,
        reason,
        roomId,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Report user error:', error);
      throw error;
    }
  }

  // 메시지 신고 처리
  async reportMessage(reporterId: string, messageId: string, reason: string, roomId: string): Promise<void> {
    try {
      // 신고 데이터 저장 로직
      console.log('Message reported:', { reporterId, messageId, reason, roomId });
      
      // 관리자에게 알림
      this.notifyAdmins({
        type: 'message_report',
        reporterId,
        messageId,
        reason,
        roomId,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Report message error:', error);
      throw error;
    }
  }

  // 관리자 알림
  private notifyAdmins(report: Record<string, unknown>): void {
    // 실제 구현에서는 관리자 대시보드나 알림 시스템에 전송
    console.log('Admin notification:', report);
  }

  // 사용자 제재 (일시 정지)
  async suspendUser(userId: string, duration: number, reason: string): Promise<void> {
    try {
      // 사용자 제재 데이터 저장
      console.log('User suspended:', { userId, duration, reason });
    } catch (error) {
      console.error('Suspend user error:', error);
      throw error;
    }
  }

  // 사용자 영구 정지
  async banUser(userId: string, reason: string): Promise<void> {
    try {
      // 사용자 영구 정지 데이터 저장
      console.log('User banned:', { userId, reason });
    } catch (error) {
      console.error('Ban user error:', error);
      throw error;
    }
  }

  // 신고된 콘텐츠 조회
  async getReports(): Promise<Record<string, unknown>[]> {
    try {
      // 신고 목록 조회 로직
      return [];
    } catch (error) {
      console.error('Get reports error:', error);
      throw error;
    }
  }
}

export const moderationService = ModerationService.getInstance();
