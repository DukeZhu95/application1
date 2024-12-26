'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  // 使用 useEffect 来处理认证重定向
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/auth/sign-in');
    }
  }, [isLoaded, userId, router]);

  // 显示加载状态
  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  // 只有在认证通过时渲染内容
  if (userId) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  // 返回空内容，让 useEffect 处理重定向
  return null;
}
