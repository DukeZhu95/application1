'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { classCodeSchema } from '@/lib/validations';
import toast from 'react-hot-toast';
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  User,
  FileText,
} from 'lucide-react';

interface ClassCodeInputProps {
  userRole: 'teacher' | 'student';
  onClassCreated?: (code: string) => void;
  isDisabled?: boolean;
}

export function ClassCodeInput({ userRole, isDisabled = false }: ClassCodeInputProps) {
  const { user } = useUser();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [className, setClassName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const createClass = useMutation(api.classes.createClass);
  const joinClass = useMutation(api.classes.joinClass);

  // 获取教师资料
  const teacherProfile = useQuery(
    api.teachers.getTeacherProfile,
    user?.id && userRole === 'teacher' ? { teacherId: user.id } : 'skip'
  );

  // 检查班级代码是否存在（教师端用于检测冲突，学生端用于验证）
  const classInfo = useQuery(
    api.classes.getClassByCode,
    code.length >= 4 ? { code: code.toUpperCase() } : 'skip'
  );

  // 当代码变化时，检查冲突
  useEffect(() => {
    if (userRole === 'teacher' && code.length >= 6 && classInfo) {
      setError('This class code is already in use. Please generate another one.');
    } else if (error.includes('already in use')) {
      setError('');
    }
  }, [code, classInfo, userRole, error]);

  const generateClassCode = () => {
    setIsGenerating(true);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    setTimeout(() => {
      setCode(result);
      setError('');
      setIsGenerating(false);
    }, 300);
  };

  const validateForm = (showToast: boolean = false): boolean => {
    if (userRole === 'teacher') {
      if (!className.trim()) {
        setError('Please enter a class name');
        if (showToast) {
          toast.error('Please enter a class name');
        }
        return false;
      }

      if (!code.trim() || code.length < 6) {
        setError('Please generate or enter a valid class code (6 characters)');
        if (showToast) {
          toast.error('Please generate a valid class code');
        }
        return false;
      }

      if (classInfo) {
        setError('This class code is already in use');
        if (showToast) {
          toast.error('This class code is already in use');
        }
        return false;
      }
    } else {
      if (!classInfo) {
        setError('This class code does not exist');
        return false;
      }
    }

    setError('');
    return true;
  };

  const handleShowPreview = () => {
    if (validateForm(false)) {  // 不显示 toast
      setShowPreview(true);
    }
  };

  const handleCancel = () => {
    setShowPreview(false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // 验证表单，提交时显示 toast
    if (!validateForm(true)) return;

    setLoading(true);

    try {
      const validated = classCodeSchema.parse({ code });
      const validatedCode = validated.code;

      if (userRole === 'teacher') {
        const teacherName = teacherProfile?.firstName
          ? `${teacherProfile.firstName} ${teacherProfile.lastName || ''}`.trim()
          : user?.firstName || 'Teacher';

        // 创建课程
        await createClass({
          code: validatedCode,
          teacherId: user?.id || '',
          name: className.trim(),
          description: description.trim() || undefined,
          teacherName,
        });

        // 创建成功后立即显示成功提示并清理
        toast.success(`Class "${className}" created successfully! 🎉`);

        // 清空表单
        setCode('');
        setClassName('');
        setDescription('');
        setShowPreview(false);
        setLoading(false);

        // 页面跳转
        router.push(`/dashboard/${userRole}?classCode=${validatedCode}`);

        // 立即返回，不执行后续代码
        return;
      } else {
        await joinClass({
          code: validatedCode,
          studentId: user?.id || '',
        });

        toast.success('Successfully joined the class! 🎉');
        setLoading(false);
        router.push(`/dashboard/${userRole}?classCode=${validatedCode}`);
        return;
      }
    } catch (err: unknown) {
      setLoading(false);
      if (err instanceof Error) {
        if (err.message.includes('already')) {
          const message = userRole === 'teacher'
            ? 'Class code already exists'
            : 'You have already joined this class';
          setError(message);
          toast.error(message);
        } else {
          setError(err.message);
          toast.error(err.message);
        }
      } else {
        setError('An error occurred');
        toast.error('An error occurred');
      }
    }
  };

  const displayName = teacherProfile?.firstName
    ? `${teacherProfile.firstName} ${teacherProfile.lastName || ''}`.trim()
    : user?.firstName || 'Teacher';

  // 教师端界面
  if (userRole === 'teacher') {
    return (
      <div className="class-code-input-container">
        {/* 输入区域 */}
        <div style={{ marginBottom: '1.5rem' }}>
          {/* 课程名称 */}
          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#4b5563',
                marginBottom: '0.5rem',
              }}
            >
              Class Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Advanced Computing, Introduction to Programming"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              disabled={isDisabled || loading}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.9)',
                border: '2px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '12px',
                padding: '0.875rem 1rem',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#1a202c',
                transition: 'all 0.3s',
              }}
            />
          </div>

          {/* 课程代码 */}
          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#4b5563',
                marginBottom: '0.5rem',
              }}
            >
              Class Code <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError('');
                }}
                disabled={isDisabled || loading}
                maxLength={6}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: !!classInfo && code.length >= 6
                    ? '2px solid rgba(239, 68, 68, 0.5)'
                    : '2px solid rgba(139, 92, 246, 0.2)',
                  borderRadius: '12px',
                  padding: '0.875rem 1rem',
                  fontSize: '1rem',
                  fontWeight: '700',
                  letterSpacing: '0.05em',
                  color: '#1a202c',
                  transition: 'all 0.3s',
                }}
              />
              <button
                type="button"
                onClick={generateClassCode}
                disabled={isDisabled || isGenerating || loading}
                style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  color: '#8b5cf6',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  borderRadius: '12px',
                  padding: '0.875rem 1.25rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {isGenerating ? (
                  <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Sparkles size={16} />
                )}
                Generate
              </button>
            </div>

            {/* 代码冲突提示 */}
            {!!classInfo && code.length >= 6 && (
              <div
                style={{
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={16} style={{ color: '#ef4444', flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#991b1b', fontWeight: '600' }}>
                  This code is already in use. Please generate another one.
                </p>
              </div>
            )}
          </div>

          {/* 课程简介 */}
          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#4b5563',
                marginBottom: '0.5rem',
              }}
            >
              Description (Optional)
            </label>
            <textarea
              placeholder="Brief description of the class (e.g., topics, goals, requirements)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isDisabled || loading}
              rows={3}
              maxLength={500}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.9)',
                border: '2px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '12px',
                padding: '0.875rem 1rem',
                fontSize: '0.875rem',
                color: '#1a202c',
                transition: 'all 0.3s',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
            <p
              style={{
                marginTop: '0.25rem',
                fontSize: '0.75rem',
                color: '#6b7280',
                textAlign: 'right',
              }}
            >
              {description.length}/500 characters
            </p>
          </div>

          {/* 错误提示 */}
          {error && !error.includes('already in use') && (
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
              <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: '600', color: '#ef4444' }}>
                {error}
              </p>
            </div>
          )}
        </div>

        {/* 预览区域 */}
        {showPreview && className && code && (
          <div
            style={{
              marginBottom: '1.5rem',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '2px solid rgba(139, 92, 246, 0.3)',
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
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
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
                  {className}
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280', fontWeight: '600' }}>
                  Code: {code.toUpperCase()}
                </p>
              </div>
              <CheckCircle2 size={24} style={{ color: '#8b5cf6', flexShrink: 0 }} />
            </div>

            {/* 教师信息 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                background: 'rgba(139, 92, 246, 0.05)',
                borderRadius: '8px',
                marginBottom: description ? '0.75rem' : '1rem',
              }}
            >
              <User size={16} style={{ color: '#8b5cf6' }} />
              <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                <strong>Teacher:</strong> {displayName}
              </span>
            </div>

            {/* 课程描述 */}
            {description && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  background: 'rgba(139, 92, 246, 0.05)',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                }}
              >
                <FileText size={16} style={{ color: '#8b5cf6', flexShrink: 0, marginTop: '0.125rem' }} />
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#4b5563', lineHeight: '1.5' }}>
                  {description}
                </p>
              </div>
            )}

            {/* 操作按钮 */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => handleSubmit()}
                disabled={loading}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.875rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
              >
                {loading ? 'Creating...' : 'Confirm & Create Class'}
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
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
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* 如果没有预览，显示创建按钮 */}
        {!showPreview && (
          <button
            onClick={handleShowPreview}
            disabled={isDisabled || loading || !className || !code || (!!classInfo && code.length >= 6)}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '1rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              opacity: (!className || !code || (!!classInfo && code.length >= 6)) ? 0.5 : 1,
            }}
          >
            Preview & Create Class
          </button>
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
            @keyframes spin {
                from {
                    transform: rotate(0deg);
                }
                to {
                    transform: rotate(360deg);
                }
            }
        `}</style>
      </div>
    );
  }

  // 学生端界面（保持原样）
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Join Class</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter 6-digit code"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={6}
          />
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          {code.length === 6 && !error && (
            <p className="text-sm mt-1">
              {classInfo ? (
                <span className="text-green-600">
                  ✓ Class found: {classInfo.name || code}
                </span>
              ) : (
                <span className="text-red-500">✗ Class not found</span>
              )}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || code.length !== 6 || !classInfo}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Join Class'}
        </button>
      </form>
    </div>
  );
}