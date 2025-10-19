'use client';

import React, { useState } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import { StudentProfileEditor } from './profile-editor';

interface CustomUserMenuProps {
  afterSignOutUrl?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: string | null;
    bio?: string;
    city?: string;
    country?: string;
    major?: string;
    goal?: string;
    _id?: string;
    _creationTime?: number;
    updatedAt?: number;
    studentId?: string;
  } | null | undefined;
}

export function CustomUserMenu({ afterSignOutUrl = '/auth/sign-in', profile }: CustomUserMenuProps) {
  const { user } = useUser();
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);

  // 检查是否有有效的头像
  const hasCustomAvatar = profile?.avatar && typeof profile.avatar === 'string' && profile.avatar.length > 0;

  return (
    <>
      <div className="custom-user-menu-wrapper" onClick={(e) => e.stopPropagation()}>
        {/* 如果有自定义头像，显示自定义头像覆盖层 */}
        {hasCustomAvatar && (
          <div className="custom-avatar-overlay">
            <img
              src={profile.avatar!}
              alt="Profile Avatar"
              className="custom-avatar-image"
            />
          </div>
        )}

        <UserButton
          afterSignOutUrl={afterSignOutUrl}
          appearance={{
            elements: {
              userButtonPopoverActionButton__manageAccount: {
                display: 'none'
              },
              userButtonAvatarBox: hasCustomAvatar ? {
                opacity: '0'
              } : {}
            }
          }}
        >
          <UserButton.MenuItems>
            <UserButton.Action
              label="Update profile"
              labelIcon={<ProfileIcon />}
              onClick={() => setIsProfileEditorOpen(true)}
            />
          </UserButton.MenuItems>
        </UserButton>
      </div>

      <StudentProfileEditor
        isOpen={isProfileEditorOpen}
        onClose={() => setIsProfileEditorOpen(false)}
      />

      {/* 内联样式 */}
      <style jsx>{`
          .custom-user-menu-wrapper {
              position: relative;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              width: 40px;
              height: 40px;
          }

          .custom-avatar-overlay {
              position: absolute;
              top: 0;
              left: 0;
              width: 40px;
              height: 40px;
              pointer-events: none;
              z-index: 1;
              border-radius: 50%;
              overflow: hidden;
              display: flex;
              align-items: center;
              justify-content: center;
          }

          .custom-avatar-image {
              width: 40px;
              height: 40px;
              object-fit: cover;
              border-radius: 50%;
          }

          .custom-user-menu-wrapper :global(.cl-userButtonBox) {
              width: 40px !important;
              height: 40px !important;
          }

          .custom-user-menu-wrapper :global(.cl-userButtonTrigger) {
              width: 40px !important;
              height: 40px !important;
          }

          .custom-user-menu-wrapper :global(.cl-userButtonAvatarBox) {
              width: 40px !important;
              height: 40px !important;
          }

          .custom-user-menu-wrapper :global(.cl-userButtonAvatarImage) {
              width: 40px !important;
              height: 40px !important;
          }
      `}</style>
    </>
  );
}

// 简单的编辑图标
function ProfileIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}