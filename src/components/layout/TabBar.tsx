'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CreateRoomModal from '@/components/main/CreateRoomModal';
import ChatView from '@/components/main/ChatView';
import ProfileView from '@/components/profile/ProfileView';
import { 
  HomeIcon, 
  ChatBubbleLeftRightIcon, 
  UserIcon,
  PlusIcon,
  PowerIcon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid, 
  ChatBubbleLeftRightIcon as ChatIconSolid, 
  UserIcon as UserIconSolid
} from '@heroicons/react/24/solid';

interface TabBarProps {
  children: React.ReactNode;
}

const TabBar: React.FC<TabBarProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { logout } = useAuth();

  const tabs = [
    {
      id: 0,
      name: '홈',
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
      component: children
    },
    {
      id: 1,
      name: '채팅',
      icon: ChatBubbleLeftRightIcon,
      activeIcon: ChatIconSolid,
      component: <ChatView />
    },
    {
      id: 2,
      name: '프로필',
      icon: UserIcon,
      activeIcon: UserIconSolid,
      component: <ProfileView />
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-white">
            Wild Card Tennis Matching
          </h1>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="p-2 text-white hover:text-cyan-400 transition-colors"
            >
              <PlusIcon className="h-6 w-6" />
            </button>
            <button 
              onClick={logout}
              className="p-2 text-white hover:text-red-400 transition-colors"
            >
              <PowerIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {activeTabData?.component}
      </div>

      {/* Bottom Tab Bar */}
      <div className="bg-black/20 backdrop-blur-lg border-t border-white/10">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = activeTab === tab.id ? tab.activeIcon : tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center py-3 px-4 transition-colors ${
                  activeTab === tab.id
                    ? 'text-cyan-400 bg-cyan-400/10'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="h-6 w-6 mb-1" />
                <span className="text-xs font-medium">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onRoomCreated={() => {
          // 메인 뷰에서 데이터를 새로고침하도록 이벤트 발생
          window.dispatchEvent(new CustomEvent('roomCreated'));
        }}
      />
    </div>
  );
};

export default TabBar;
