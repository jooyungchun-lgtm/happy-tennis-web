'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import { LoginForm as LoginFormType } from '@/types/models';

const LoginForm: React.FC = () => {
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState<LoginFormType>({
    email: '',
    password: '',
    keepLoggedIn: false
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-4xl">🎾</span>
            <h1 className="text-3xl font-bold text-white">
              Wild Card 와카 <span className="text-cyan-400">beta</span>
            </h1>
          </div>
          <p className="text-white/80 text-lg">
            테니스 매칭 서비스에 오신 것을 환영합니다!
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/95 text-gray-900 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="이메일을 입력하세요"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/95 text-gray-900 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="비밀번호를 입력하세요"
              />
            </div>

            <div className="flex items-center">
              <input
                id="keepLoggedIn"
                name="keepLoggedIn"
                type="checkbox"
                checked={formData.keepLoggedIn}
                onChange={handleChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="keepLoggedIn" className="ml-2 block text-sm text-white/90">
                로그인 상태 유지
              </label>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={isLoading}
              disabled={isLoading}
            >
              로그인
            </Button>
          </form>

          <div className="mt-6 flex justify-center space-x-6 text-sm">
            <button 
              onClick={() => window.location.href = '/signup'}
              className="text-white hover:text-cyan-400 transition-colors"
            >
              회원가입
            </button>
            <button className="text-white/80 hover:text-cyan-400 transition-colors">
              비밀번호 찾기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
