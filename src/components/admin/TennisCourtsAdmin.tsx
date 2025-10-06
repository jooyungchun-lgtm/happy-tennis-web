'use client';

import React, { useState, useEffect } from 'react';
import { tennisCourtsService, TennisCourt } from '@/lib/tennisCourts';
import Button from '@/components/ui/Button';
import { 
  ArrowPathIcon, 
  PlusIcon, 
  PencilIcon, 
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface TennisCourtsAdminProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TennisCourtsAdmin({ isOpen, onClose }: TennisCourtsAdminProps) {
  const [courts, setCourts] = useState<TennisCourt[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  // const [editingCourt] = useState<TennisCourt | null>(null);
  const [newCourt, setNewCourt] = useState<Partial<TennisCourt>>({
    facility_name: '',
    region: '',
    court_number: '',
    time_period: '주간',
    target: '제한없음',
    reservation_method: '온라인',
    fee_info: '유료',
    address: '',
    phone: '02-120',
    description: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadCourts();
    }
  }, [isOpen]);

  const loadCourts = async () => {
    setLoading(true);
    try {
      const courtsData = tennisCourtsService.getAllCourts();
      setCourts(courtsData);
      setSyncStatus('데이터 로드 완료');
    } catch (error) {
      console.error('테니스장 데이터 로드 실패:', error);
      setSyncStatus('데이터 로드 실패');
    } finally {
      setLoading(false);
    }
  };

  const syncWithAPI = async () => {
    setLoading(true);
    setSyncStatus('API에서 데이터 동기화 중...');
    
    try {
      const response = await fetch('/api/tennis-courts');
      const result = await response.json();
      
      if (result.success && result.data.length > 0) {
        setCourts(result.data);
        setSyncStatus(`API에서 ${result.data.length}개 데이터 동기화 완료`);
      } else {
        setSyncStatus('API에서 데이터를 찾을 수 없습니다');
      }
    } catch (error) {
      console.error('API 동기화 실패:', error);
      setSyncStatus('API 동기화 실패');
    } finally {
      setLoading(false);
    }
  };

  const uploadToAPI = async () => {
    setLoading(true);
    setSyncStatus('API에 업로드 중...');
    
    try {
      const response = await fetch('/api/tennis-courts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courts }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSyncStatus(result.message);
      } else {
        setSyncStatus(result.error || 'API 업로드 실패');
      }
    } catch (error) {
      console.error('API 업로드 실패:', error);
      setSyncStatus('API 업로드 실패');
    } finally {
      setLoading(false);
    }
  };

  const addCourt = async () => {
    if (!newCourt.facility_name || !newCourt.region || !newCourt.court_number) {
      alert('필수 정보를 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/tennis-courts/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCourt),
      });
      
      const result = await response.json();
      
      if (result.success) {
        await loadCourts();
        setShowAddForm(false);
        setNewCourt({
          facility_name: '',
          region: '',
          court_number: '',
          time_period: '주간',
          target: '제한없음',
          reservation_method: '온라인',
          fee_info: '유료',
          address: '',
          phone: '02-120',
          description: ''
        });
        setSyncStatus(result.message);
      } else {
        setSyncStatus(result.error || '테니스장 추가 실패');
      }
    } catch (error) {
      console.error('테니스장 추가 실패:', error);
      setSyncStatus('테니스장 추가 실패');
    } finally {
      setLoading(false);
    }
  };

  const openDataManagement = () => {
    // 데이터 관리 페이지로 이동하거나 모달 표시
    alert('데이터 관리 기능은 추후 구현 예정입니다.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 w-full max-w-6xl max-h-[90vh] border border-white/20 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">테니스장 관리</h2>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 동기화 상태 및 컨트롤 */}
        <div className="mb-6 p-4 bg-white/5 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button
                onClick={syncWithAPI}
                loading={loading}
                className="flex items-center space-x-2"
              >
                <ArrowPathIcon className="h-4 w-4" />
                <span>API에서 가져오기</span>
              </Button>
              
              <Button
                onClick={uploadToAPI}
                loading={loading}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <ArrowPathIcon className="h-4 w-4" />
                <span>API에 업로드</span>
              </Button>
              
              <Button
                onClick={openDataManagement}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <InformationCircleIcon className="h-4 w-4" />
                <span>데이터 관리</span>
              </Button>
            </div>
            
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>새 테니스장 추가</span>
            </Button>
          </div>
          
          {syncStatus && (
            <div className="flex items-center space-x-2 text-sm">
              <InformationCircleIcon className="h-4 w-4 text-blue-400" />
              <span className="text-white/80">{syncStatus}</span>
            </div>
          )}
        </div>

        {/* 새 테니스장 추가 폼 */}
        {showAddForm && (
          <div className="mb-6 p-4 bg-white/5 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4">새 테니스장 추가</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">시설명 *</label>
                <input
                  type="text"
                  value={newCourt.facility_name || ''}
                  onChange={(e) => setNewCourt(prev => ({ ...prev, facility_name: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 text-white rounded-lg border border-white/20"
                  placeholder="예: 한남테니스장"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">지역 *</label>
                <input
                  type="text"
                  value={newCourt.region || ''}
                  onChange={(e) => setNewCourt(prev => ({ ...prev, region: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 text-white rounded-lg border border-white/20"
                  placeholder="예: 용산구"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">코트번호 *</label>
                <input
                  type="text"
                  value={newCourt.court_number || ''}
                  onChange={(e) => setNewCourt(prev => ({ ...prev, court_number: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 text-white rounded-lg border border-white/20"
                  placeholder="예: 3번코트"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">시간대</label>
                <select
                  value={newCourt.time_period || '주간'}
                  onChange={(e) => setNewCourt(prev => ({ ...prev, time_period: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 text-white rounded-lg border border-white/20"
                >
                  <option value="주간">주간</option>
                  <option value="야간">야간</option>
                  <option value="주말/공휴일">주말/공휴일</option>
                  <option value="평일">평일</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">주소</label>
                <input
                  type="text"
                  value={newCourt.address || ''}
                  onChange={(e) => setNewCourt(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 text-white rounded-lg border border-white/20"
                  placeholder="예: 서울특별시 용산구 한남동"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">전화번호</label>
                <input
                  type="text"
                  value={newCourt.phone || ''}
                  onChange={(e) => setNewCourt(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 text-white rounded-lg border border-white/20"
                  placeholder="예: 02-120"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-white/80 mb-2">설명</label>
              <textarea
                value={newCourt.description || ''}
                onChange={(e) => setNewCourt(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 bg-white/10 text-white rounded-lg border border-white/20"
                rows={2}
                placeholder="테니스장에 대한 추가 설명"
              />
            </div>
            
            <div className="flex space-x-4 mt-4">
              <Button onClick={addCourt} loading={loading}>
                추가
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddForm(false)}
              >
                취소
              </Button>
            </div>
          </div>
        )}

        {/* 테니스장 목록 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">테니스장 목록 ({courts.length}개)</h3>
          
          {loading ? (
            <div className="text-center py-8 text-white/60">
              로딩 중...
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {courts.map((court, index) => (
                <div
                  key={index}
                  className="p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-white">
                        {court.facility_name} - {court.court_number}
                      </div>
                      <div className="text-sm text-white/70">
                        {court.region} | {court.time_period} | {court.fee_info}
                      </div>
                      <div className="text-xs text-white/50 mt-1">
                        {court.address} | {court.phone}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {/* 편집 기능은 추후 구현 예정 */}}
                        className="p-2 text-white/60 hover:text-white transition-colors"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
