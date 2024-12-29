'use client';
import { SignUp } from '@clerk/nextjs';
import { useSignUp } from '@clerk/nextjs';
import { useState } from 'react';
import { UserIdInput } from '@/app/components/auth/user-id-input';
import { RoleSelect } from '@/app/components/auth/role-select';

export default function SignUpPage() {
  const [showIdInput, setShowIdInput] = useState(false);
  const { isLoaded, signUp } = useSignUp();

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <RoleSelect />
      {showIdInput ? (
        <UserIdInput
          onIdSubmit={async (id) => {
            try {
              // 存储 ID 到用户元数据
              await signUp.update({
                unsafeMetadata: {
                  alphanumericId: id,
                },
              });
              // 继续注册流程
              setShowIdInput(false);
            } catch (err) {
              console.error('Error updating user metadata:', err);
            }
          }}
        />
      ) : (
        <SignUp
          path="/auth/sign-up"
          routing="path"
          signInUrl="/auth/sign-in"
          redirectUrl="/dashboard"
          afterSignUpUrl="/dashboard"
          appearance={{
            elements: {
              formButtonPrimary: {
                onClick: () => {
                  // 在邮箱验证后显示 ID 输入
                  setShowIdInput(true);
                },
              },
            },
          }}
        />
      )}
    </div>
  );
}
