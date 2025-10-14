'use client';

import { SignUp } from '@clerk/nextjs';
import { useSignUp } from '@clerk/nextjs';
import { useState } from 'react';
import { UserIdInput } from '@/app/components/auth/user-id-input';

export default function SignUpPage() {
  const [showIdInput, setShowIdInput] = useState(false);
  const { isLoaded, signUp } = useSignUp();

  if (!isLoaded) {
    return null;
  }

  // 如果显示ID输入，只显示ID输入组件
  if (showIdInput) {
    return (
      <div className="auth-page-container">
        {/* 渐变背景 */}
        <div className="auth-page-background"></div>

        {/* 用户ID输入组件 */}
        <UserIdInput
          onIdSubmit={async (id) => {
            try {
              await signUp.update({
                unsafeMetadata: {
                  alphanumericId: id,
                },
              });
              // 完成ID输入后重定向到角色选择
              window.location.href = '/select-role';
            } catch (err) {
              console.error('Error updating user metadata:', err);
            }
          }}
        />
      </div>
    );
  }

  // 否则显示注册表单
  return (
    <div className="auth-page-container">
      {/* 渐变背景 */}
      <div className="auth-page-background"></div>

      {/* Clerk 注册组件 */}
      <SignUp
        path="/auth/sign-up"
        routing="path"
        signInUrl="/auth/sign-in"
        afterSignUpUrl="/select-role"
        appearance={{
          elements: {
            formButtonPrimary: {
              onClick: () => {
                // 注册完成后显示ID输入
                setShowIdInput(true);
              },
            },
          },
        }}
      />
    </div>
  );
}