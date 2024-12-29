'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import React, { useEffect } from 'react';

interface RouteGuardProps {
  children: React.ReactNode;
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const userRole = useQuery(api.users.getUserRole, {
    userId: user?.id ?? '',
  });

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push('/auth/sign-in');
      return;
    }

    // 如果用户还没有选择角色且不在角色选择页面，重定向到角色选择页面
    if (!userRole && pathname !== '/select-role') {
      router.push('/select-role');
      return;
    }

    // 检查用户是否在尝试访问正确的角色路由
    if (userRole) {
      if (
        pathname.startsWith('/dashboard/teacher') &&
        userRole.role !== 'teacher'
      ) {
        router.push('/dashboard/student');
        return;
      }
      if (
        pathname.startsWith('/dashboard/student') &&
        userRole.role !== 'student'
      ) {
        router.push('/dashboard/teacher');
        return;
      }
    }
  }, [user, isLoaded, userRole, pathname, router]);

  if (!isLoaded || !user) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}
