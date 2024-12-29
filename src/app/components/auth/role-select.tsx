'use client';

import { useUser } from '@clerk/nextjs';
import { Button } from '../ui/button';
import { useState, useEffect } from 'react';
import { UserRole } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { toast } from '../ui/use-toast';

export function RoleSelect() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const setUserRole = useMutation(api.users.setUserRole);
  const userRole = useQuery(api.users.getUserRole, {
    userId: user?.id ?? '',
  });

  // 使用 useEffect 处理角色检查和重定向
  useEffect(() => {
    if (userRole?.role) {
      const destination =
        userRole.role === 'teacher'
          ? '/dashboard/teacher'
          : '/dashboard/student';
      router.push(destination);
    }
  }, [userRole, router]);

  // 如果已经有角色，不渲染选择界面
  if (userRole?.role) {
    return null;
  }

  const selectRole = async (role: UserRole) => {
    if (!user) return;

    try {
      setIsLoading(true);

      await setUserRole({
        userId: user.id,
        email: user.emailAddresses[0]?.emailAddress ?? '',
        role,
        name: user.fullName ?? '',
      });

      toast({
        title: 'Success',
        description: 'Role set successfully',
      });

      // 让 useEffect 处理重定向
    } catch (error) {
      console.error('Error selecting role:', error);
      toast({
        title: 'Error',
        description: 'Failed to set role',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Select your role:</h2>
        <p className="text-sm text-gray-600">Please select your account type</p>
      </div>

      <div className="flex flex-col gap-4">
        <Button
          onClick={() => selectRole('teacher')}
          disabled={isLoading}
          className="w-full"
          variant="outline"
        >
          I am a teacher
        </Button>

        <Button
          onClick={() => selectRole('student')}
          disabled={isLoading}
          className="w-full"
          variant="outline"
        >
          I am a student
        </Button>
      </div>
    </div>
  );
}
