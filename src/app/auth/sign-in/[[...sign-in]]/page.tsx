'use client';

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="auth-page-container">
      {/* 渐变背景 */}
      <div className="auth-page-background"></div>

      {/* Clerk 登录组件 */}
      <SignIn
        path="/auth/sign-in"
        routing="path"
        signUpUrl="/auth/sign-up"
        afterSignInUrl="/select-role"
      />
    </div>
  );
}