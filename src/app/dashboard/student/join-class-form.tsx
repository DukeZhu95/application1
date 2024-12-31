'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { toast } from '@/app/components/ui/use-toast';
import { Card, CardContent } from '@/app/components/ui/card';
import { useRouter } from 'next/navigation';

interface ConvexError {
  message: string;
  [key: string]: any;
}

export function JoinClassForm() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const joinClass = useMutation(api.classes.joinClass);
  const { user } = useUser();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !code.trim()) return;

    console.log('Attempting to join class with code:', code);
    console.log('User ID:', user.id);

    try {
      setIsLoading(true);
      const result = await joinClass({
        code: code.toUpperCase(),
        studentId: user.id,
      });

      console.log('Join class result:', result);

      toast({
        title: 'Success',
        description: 'Successfully joined the class',
      });

      // 清空输入
      setCode('');

      // 使用 router.push 到当前路径来触发页面刷新
      const currentPath = window.location.pathname;
      router.push(currentPath);
    } catch (error) {
      console.error('Error joining class:', error);

      // 使用类型守卫来检查错误
      const convexError = error as ConvexError;
      let errorMessage = 'Failed to join class';

      if (convexError.message) {
        if (convexError.message.includes('already a member')) {
          errorMessage = 'You are already a member of this class';
        } else if (convexError.message.includes('not found')) {
          errorMessage = 'Class not found. Please check the code and try again';
        }
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Enter class code (e.g., COM555)"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="uppercase"
              disabled={isLoading}
              required
              minLength={4}
              maxLength={10}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={!code.trim() || isLoading}
          >
            {isLoading ? 'Joining...' : 'Join class'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
