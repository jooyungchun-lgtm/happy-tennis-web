'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile, ProfileForm } from '@/types/models';
import Button from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { 
  UserIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const ProfileView: React.FC = () => {
  const { userProfile, saveUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileForm>({
    name: '',
    gender: '남성',
    ageGroup: '20대',
    homeCourt: '',
    ntrp: 1.0,
    experience: 0.5
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name,
        gender: userProfile.gender,
        ageGroup: userProfile.ageGroup,
        homeCourt: userProfile.homeCourt,
        ntrp: userProfile.ntrp,
        experience: userProfile.experience
      });
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    setError('');
    setIsLoading(true);

    try {
      const updatedProfile: UserProfile = {
        ...userProfile,
        ...formData,
        lastModified: new Date(),
        isComplete: !!(formData.name.trim() && formData.homeCourt.trim()),
        canEdit: true,
        nextEditDate: new Date()
      };

      await saveUserProfile(updatedProfile);
      setIsEditing(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '프로필 저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleCancel = () => {
    if (userProfile) {
      setFormData({
        name: userProfile.name,
        gender: userProfile.gender,
        ageGroup: userProfile.ageGroup,
        homeCourt: userProfile.homeCourt,
        ntrp: userProfile.ntrp,
        experience: userProfile.experience
      });
    }
    setIsEditing(false);
    setError('');
  };

  if (!userProfile) {
    return (
      <div className="p-4 text-center">
        <div className="text-white/60">프로필을 불러올 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* 프로필 헤더 */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
            <UserIcon className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white">{userProfile.name}</h2>
            <p className="text-white/70 text-sm">
              마지막 수정: {formatDate(userProfile.lastModified)}
            </p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 text-white/70 hover:text-white transition-colors"
          >
            {isEditing ? <XMarkIcon className="h-6 w-6" /> : <PencilIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* 프로필 폼 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">기본 정보</h3>
          
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              이름
            </label>
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-4 py-3 bg-white/95 text-gray-900 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100"
              placeholder="이름을 입력하세요"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                성별
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-white/95 text-gray-900 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100"
              >
                <option value="남성">남성</option>
                <option value="여성">여성</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                연령대
              </label>
              <select
                name="ageGroup"
                value={formData.ageGroup}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-white/95 text-gray-900 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100"
              >
                <option value="10대">10대</option>
                <option value="20대">20대</option>
                <option value="30대">30대</option>
                <option value="40대">40대</option>
                <option value="50대">50대</option>
                <option value="60대 이상">60대 이상</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              홈코트
            </label>
            <input
              name="homeCourt"
              type="text"
              value={formData.homeCourt}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-4 py-3 bg-white/95 text-gray-900 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100"
              placeholder="자주 이용하는 테니스장을 입력하세요"
            />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">테니스 정보</h3>
          
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
              disabled={!isEditing}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="flex justify-between text-xs text-white/60 mt-1">
              <span>1.0 (초보)</span>
              <span>7.0 (프로)</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              경험 (년): {formData.experience}
            </label>
            <input
              name="experience"
              type="range"
              min="0"
              max="20"
              step="0.5"
              value={formData.experience}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="flex justify-between text-xs text-white/60 mt-1">
              <span>0년</span>
              <span>20년</span>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex space-x-4">
            <Button
              type="submit"
              className="flex-1"
              loading={isLoading}
              disabled={isLoading}
            >
              <CheckIcon className="h-5 w-5 mr-2" />
              저장
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              <XMarkIcon className="h-5 w-5 mr-2" />
              취소
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileView;
