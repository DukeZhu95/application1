'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle, BookOpen, User, Info } from 'lucide-react';

interface ConvexError {
  message: string;
  code?: string;
  data?: unknown;
  stack?: string;
}

export function JoinClassForm() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const joinClass = useMutation(api.classes.joinClass);
  const { user } = useUser();
  const router = useRouter();

  // 查询课程信息（用于预览）
  const classPreview = useQuery(
    api.classes.getClassByCode,
    code.length >= 4 ? { code: code.toUpperCase() } : 'skip'
  );

  // 当用户输入代码时，自动显示预览或错误
  useEffect(() => {
    if (code.length >= 4) {
      const timer = setTimeout(() => {
        if (classPreview === null) {
          setPreviewError('Class not found. Please check the code.');
          setShowPreview(false);
        } else if (classPreview) {
          setPreviewError(null);
          setShowPreview(true);
        }
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setShowPreview(false);
      setPreviewError(null);
    }
  }, [code, classPreview]);

  const handleJoinClass = async () => {
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

      toast.success('Successfully joined the class! 🎉');

      // 清空输入
      setCode('');
      setShowPreview(false);

      // 使用 router.push 到当前路径来触发页面刷新
      const currentPath = window.location.pathname;
      router.push(currentPath);
    } catch (error) {
      console.error('Error joining class:', error);

      const convexError = error as ConvexError;
      let errorMessage = 'Failed to join class';

      if (convexError.message) {
        if (convexError.message.includes('already a member')) {
          errorMessage = 'You are already a member of this class';
        } else if (convexError.message.includes('not found')) {
          errorMessage = 'Class not found. Please check the code and try again';
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setCode('');
    setShowPreview(false);
    setPreviewError(null);
  };

  return (
    <div className="join-class-form-container">
      {/* 输入区域 */}
      <div className="join-class-input-section">
        <Input
          placeholder="Enter class code (e.g., COM555)"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          disabled={isLoading}
          required
          minLength={4}
          maxLength={10}
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            border: '2px solid rgba(79, 172, 254, 0.2)',
            borderRadius: '12px',
            padding: '0.875rem 1rem',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#1a202c',
            transition: 'all 0.3s',
          }}
          onFocus={(e) => {
            e.target.style.border = '2px solid rgba(79, 172, 254, 0.5)';
            e.target.style.boxShadow = '0 0 0 4px rgba(79, 172, 254, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.border = '2px solid rgba(79, 172, 254, 0.2)';
            e.target.style.boxShadow = 'none';
          }}
        />

        {/* 错误提示 */}
        {previewError && code.length >= 4 && (
          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <AlertCircle size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: '600', color: '#ef4444' }}>
                {previewError}
              </p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#991b1b' }}>
                Double-check the code with your teacher
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 课程预览 */}
      {showPreview && classPreview && (
        <div
          className="class-preview"
          style={{
            marginTop: '1.5rem',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '2px solid rgba(79, 172, 254, 0.3)',
            borderRadius: '16px',
            padding: '1.5rem',
            animation: 'slideInUp 0.3s ease-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <BookOpen size={24} style={{ color: 'white' }} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#1a202c' }}>
                {classPreview.name || `Class ${classPreview.code}`}
              </h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280', fontWeight: '600' }}>
                Code: {classPreview.code}
              </p>
            </div>
            <CheckCircle2 size={24} style={{ color: '#10b981', flexShrink: 0 }} />
          </div>

          {/* 教师信息 */}
          {classPreview.teacherName && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                background: 'rgba(79, 172, 254, 0.05)',
                borderRadius: '8px',
                marginBottom: '0.75rem',
              }}
            >
              <User size={16} style={{ color: '#4facfe' }} />
              <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                <strong>Teacher:</strong> {classPreview.teacherName}
              </span>
            </div>
          )}

          {/* 课程描述 */}
          {classPreview.description && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                padding: '0.75rem',
                background: 'rgba(79, 172, 254, 0.05)',
                borderRadius: '8px',
                marginBottom: '1rem',
              }}
            >
              <Info size={16} style={{ color: '#4facfe', flexShrink: 0, marginTop: '0.125rem' }} />
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#4b5563', lineHeight: '1.5' }}>
                {classPreview.description}
              </p>
            </div>
          )}

          {/* 确认按钮 */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button
              onClick={handleJoinClass}
              disabled={isLoading}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '0.875rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(79, 172, 254, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {isLoading ? 'Joining...' : 'Confirm & Join Class'}
            </Button>
            <Button
              onClick={handleCancel}
              disabled={isLoading}
              style={{
                background: 'rgba(107, 114, 128, 0.1)',
                color: '#6b7280',
                border: '1px solid rgba(107, 114, 128, 0.2)',
                borderRadius: '12px',
                padding: '0.875rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(107, 114, 128, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(107, 114, 128, 0.1)';
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* 如果没有预览，显示普通的 Join 按钮 */}
      {!showPreview && !previewError && code.length >= 4 && (
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
            Searching for class...
          </p>
        </div>
      )}

      {!showPreview && code.length < 4 && (
        <div style={{ marginTop: '1rem' }}>
          <p
            style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              margin: 0,
              textAlign: 'center',
            }}
          >
            Enter at least 4 characters to search
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}