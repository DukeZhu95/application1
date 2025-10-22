'use client';

import { useState } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { TeacherProfileEditor } from './profile-editor';
import { Settings, LogOut } from 'lucide-react';

// 定义 profile 类型
interface TeacherProfile {
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

interface CustomUserMenuProps {
  afterSignOutUrl?: string;
  profile?: TeacherProfile | null; // 改为具体类型
}

export function CustomUserMenu({ afterSignOutUrl, profile }: CustomUserMenuProps) {
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useUser();
  const { signOut } = useClerk();

  // 使用自定义头像或 Google 头像
  const avatarUrl = profile?.avatar || user?.imageUrl;

  return (
    <div className="relative">
      {/* 自定义头像按钮 */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 hover:border-white/50 transition-all"
      >
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-full h-full object-cover"
        />
      </button>

      {/* 下拉菜单 */}
      {isMenuOpen && (
        <>
          {/* 背景遮罩 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* 菜单内容 */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-50 overflow-hidden">
            {/* 用户信息 */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-semibold text-gray-900">
                    {profile?.firstName || user?.firstName} {profile?.lastName || user?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </div>
            </div>

            {/* 菜单选项 */}
            <div className="py-2">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsProfileEditorOpen(true);
                }}
                className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
              >
                <Settings size={18} className="text-gray-600" />
                <span className="text-gray-700">Manage account</span>
              </button>

              <button
                onClick={() => signOut({ redirectUrl: afterSignOutUrl || '/auth/sign-in' })}
                className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors text-red-600"
              >
                <LogOut size={18} />
                <span>Sign out</span>
              </button>
            </div>

            {/* Clerk 标识 */}
            <div className="px-4 py-2 bg-gray-50 border-t text-center text-xs text-gray-500">
              Secured by <strong>Clerk</strong>
            </div>
          </div>
        </>
      )}

      <TeacherProfileEditor
        isOpen={isProfileEditorOpen}
        onClose={() => setIsProfileEditorOpen(false)}
      />
    </div>
  );
}