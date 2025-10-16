'use client';

import { useUser } from '@clerk/nextjs';
import { Button } from '../ui/button';
import { useState, useEffect } from 'react';
import { UserRole } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { toast } from '../ui/use-toast';
import { 
  GraduationCap, 
  BookOpen,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export function RoleSelect() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredRole, setHoveredRole] = useState<UserRole | null>(null);
  const router = useRouter();

  const setUserRole = useMutation(api.users.setUserRole);
  const userRole = useQuery(api.users.getUserRole, {
    userId: user?.id ?? '',
  });

  useEffect(() => {
    if (userRole?.role) {
      const destination =
        userRole.role === 'teacher'
          ? '/dashboard/teacher'
          : '/dashboard/student';
      router.push(destination);
    }
  }, [userRole, router]);

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
    <div className="glass-role-select-container">
      {/* 动态背景 */}
      <div className="glass-role-background">
        <div className="glass-role-gradient-1"></div>
        <div className="glass-role-gradient-2"></div>
        <div className="glass-role-gradient-3"></div>
      </div>

      <div className="glass-role-content">
        {/* 顶部标题 */}
        <div className="glass-role-header">
          <div className="glass-role-sparkle">
            <Sparkles size={40} strokeWidth={2} />
          </div>
          <h1 className="glass-role-title">Welcome to the Platform! 🎉</h1>
          <p className="glass-role-subtitle">
            Choose your role to get started on your learning journey
          </p>
        </div>

        {/* 角色选择卡片 */}
        <div className="glass-role-cards">
          {/* 教师卡片 */}
          <div
            className={`glass-role-card glass-role-teacher ${
              hoveredRole === 'teacher' ? 'glass-role-card-hovered' : ''
            } ${hoveredRole && hoveredRole !== 'teacher' ? 'glass-role-card-dimmed' : ''}`}
            onMouseEnter={() => setHoveredRole('teacher')}
            onMouseLeave={() => setHoveredRole(null)}
          >
            <div className="glass-role-card-glow glass-role-teacher-glow"></div>
            
            <div className="glass-role-card-content">
              {/* 图标 */}
              <div className="glass-role-icon-wrapper glass-role-teacher-icon">
                <GraduationCap size={64} strokeWidth={1.5} />
                <div className="glass-role-icon-ring"></div>
              </div>

              {/* 标题 */}
              <h2 className="glass-role-card-title">Teacher</h2>
              <p className="glass-role-card-description">
                Create and manage classes, assign tasks, and track student progress
              </p>

              {/* 特性列表 */}
              <div className="glass-role-features">
                <div className="glass-role-feature">
                  <CheckCircle2 size={20} strokeWidth={2.5} />
                  <span>Create & manage classes</span>
                </div>
                <div className="glass-role-feature">
                  <CheckCircle2 size={20} strokeWidth={2.5} />
                  <span>Assign tasks & activities</span>
                </div>
                <div className="glass-role-feature">
                  <CheckCircle2 size={20} strokeWidth={2.5} />
                  <span>Track student performance</span>
                </div>
                <div className="glass-role-feature">
                  <CheckCircle2 size={20} strokeWidth={2.5} />
                  <span>Grade submissions</span>
                </div>
              </div>

              {/* 按钮 */}
              <Button
                onClick={() => selectRole('teacher')}
                disabled={isLoading}
                className="glass-role-btn glass-role-teacher-btn"
              >
                <span>I am a Teacher</span>
                <ArrowRight size={20} strokeWidth={2.5} />
              </Button>
            </div>
          </div>

          {/* 学生卡片 */}
          <div
            className={`glass-role-card glass-role-student ${
              hoveredRole === 'student' ? 'glass-role-card-hovered' : ''
            } ${hoveredRole && hoveredRole !== 'student' ? 'glass-role-card-dimmed' : ''}`}
            onMouseEnter={() => setHoveredRole('student')}
            onMouseLeave={() => setHoveredRole(null)}
          >
            <div className="glass-role-card-glow glass-role-student-glow"></div>
            
            <div className="glass-role-card-content">
              {/* 图标 */}
              <div className="glass-role-icon-wrapper glass-role-student-icon">
                <BookOpen size={64} strokeWidth={1.5} />
                <div className="glass-role-icon-ring"></div>
              </div>

              {/* 标题 */}
              <h2 className="glass-role-card-title">Student</h2>
              <p className="glass-role-card-description">
                Join classes, complete assignments, and track your learning progress
              </p>

              {/* 特性列表 */}
              <div className="glass-role-features">
                <div className="glass-role-feature">
                  <CheckCircle2 size={20} strokeWidth={2.5} />
                  <span>Join classes with codes</span>
                </div>
                <div className="glass-role-feature">
                  <CheckCircle2 size={20} strokeWidth={2.5} />
                  <span>View & complete tasks</span>
                </div>
                <div className="glass-role-feature">
                  <CheckCircle2 size={20} strokeWidth={2.5} />
                  <span>Submit assignments</span>
                </div>
                <div className="glass-role-feature">
                  <CheckCircle2 size={20} strokeWidth={2.5} />
                  <span>Track your progress</span>
                </div>
              </div>

              {/* 按钮 */}
              <Button
                onClick={() => selectRole('student')}
                disabled={isLoading}
                className="glass-role-btn glass-role-student-btn"
              >
                <span>I am a Student</span>
                <ArrowRight size={20} strokeWidth={2.5} />
              </Button>
            </div>
          </div>
        </div>

        {/* 底部提示 */}
        <div className="glass-role-footer">
          <p>Don&apos;t worry, you can always change this later in settings</p>
        </div>
      </div>
    </div>
  );
}
