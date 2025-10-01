'use client';

import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  count?: number;
  height?: string;
}

export default function SkeletonLoader({ className = '', count = 1, height = 'h-4' }: SkeletonLoaderProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-white/10 rounded ${height} ${className}`}
        />
      ))}
    </>
  );
}

// 채팅방 목록용 스켈레톤
export function ChatRoomSkeleton() {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <SkeletonLoader className="w-3/4 mb-2" height="h-5" />
          <SkeletonLoader className="w-1/2" height="h-4" />
        </div>
        <div className="flex items-center space-x-2">
          <SkeletonLoader className="w-16" height="h-6" />
          <SkeletonLoader className="w-20" height="h-4" />
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm mb-4">
        <div className="flex items-center space-x-4">
          <SkeletonLoader className="w-20" height="h-4" />
          <SkeletonLoader className="w-16" height="h-4" />
          <SkeletonLoader className="w-32" height="h-4" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <SkeletonLoader className="w-24" height="h-4" />
        <SkeletonLoader className="w-20" height="h-8" />
      </div>
    </div>
  );
}

// 메시지용 스켈레톤
export function MessageSkeleton() {
  return (
    <div className="flex items-start space-x-3 p-4">
      <SkeletonLoader className="w-10 h-10 rounded-full" height="h-10" />
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <SkeletonLoader className="w-20" height="h-4" />
          <SkeletonLoader className="w-16" height="h-3" />
        </div>
        <SkeletonLoader className="w-3/4 mb-2" height="h-4" />
        <SkeletonLoader className="w-1/2" height="h-4" />
      </div>
    </div>
  );
}

// 참여자용 스켈레톤
export function ParticipantSkeleton() {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <SkeletonLoader className="w-10 h-10 rounded-full" height="h-10" />
          <div>
            <SkeletonLoader className="w-24 mb-1" height="h-4" />
            <SkeletonLoader className="w-32" height="h-3" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <SkeletonLoader className="w-16" height="h-4" />
          <SkeletonLoader className="w-8" height="h-8" />
        </div>
      </div>
    </div>
  );
}
