'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { classCodeSchema } from '@/lib/validations';

interface ClassCodeInputProps {
  userRole: 'teacher' | 'student';
  onClassCreated?: (code: string) => void;
  isDisabled?: boolean;
}

export function ClassCodeInput({ userRole }: ClassCodeInputProps) {
  const { user } = useUser();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const createClass = useMutation(api.classes.createClass);
  const joinClass = useMutation(api.classes.joinClass);

  // 只有当输入了6位代码且角色是学生时才检查班级是否存在
  const classInfo = useQuery(
    api.classes.checkClassExists,
    userRole === 'student' && code.length === 6 ? { code } : 'skip'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const validated = classCodeSchema.parse({ code }); // 传入对象
      const validatedCode = validated.code; // 获取 code 字符串

      if (userRole === 'teacher') {
        await createClass({
          code: validatedCode,
          teacherId: user?.id || '',
          name: `Class ${validatedCode}`,
        });
        router.push(`/dashboard/${userRole}?classCode=${validatedCode}`);
      } else {
        // 学生加入班级时先检查班级是否存在
        if (!classInfo?.exists) {
          setError('This class code does not exist');
          setLoading(false);
          return;
        }

        await joinClass({
          code: validatedCode,
          studentId: user?.id || '',
        });
        router.push(`/dashboard/${userRole}?classCode=${validatedCode}`);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes('already in class')) {
          setError('You have already joined this class');
        } else {
          setError(err.message);
        }
      } else {
        setError('An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const generateClassCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result; // 添加 return 语句
  };

  const handleGenerateCode = () => {
    const newCode: string = generateClassCode(); // 使用导入的函数
    setCode(newCode);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">
        {userRole === 'teacher' ? 'Create Class Code' : 'Join Class'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-digit code"
              className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={6}
            />
            {userRole === 'teacher' && (
              <button
                type="button"
                onClick={handleGenerateCode}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Generate
              </button>
            )}
          </div>
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          {userRole === 'student' && code.length === 6 && !error && (
            <p className="text-sm mt-1">
              {classInfo?.exists ? (
                <span className="text-green-600">
                  ✓ Class found: {classInfo.className || code}
                </span>
              ) : (
                <span className="text-red-500">✗ Class not found</span>
              )}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={
            loading ||
            code.length !== 6 ||
            (userRole === 'student' && !classInfo?.exists)
          }
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading
            ? 'Processing...'
            : userRole === 'teacher'
              ? 'Create Class'
              : 'Join Class'}
        </button>
      </form>
    </div>
  );
}
