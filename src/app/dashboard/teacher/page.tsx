'use client';

import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { api } from '../../../../convex/_generated/api';
import { ClassCodeInput } from '@/app/components/shared/class-code-input';
import { TasksTracking } from '@/app/dashboard/teacher/tasks-tracking';
import '@/styles/components/teacher-dashboard-glass.css';
import { Toaster } from 'react-hot-toast';
import { CustomUserMenu } from '@/app/dashboard/teacher/custom-user-menu';
import {
  GraduationCap,
  Users,
  Plus,
  BookOpen,
  TrendingUp,
  Award,
  Clock,
  Sparkles,
  CheckSquare
} from 'lucide-react';

export default function TeacherDashboard() {
  const { user } = useUser();
  const router = useRouter();

  const classes = useQuery(api.classes.getTeacherClasses, {
    teacherId: user?.id || '',
  });

  // 获取教师资料
  const profile = useQuery(
    api.teachers.getTeacherProfile,
    user?.id ? { teacherId: user.id } : 'skip'
  );

  // 获取显示的名字
  const displayName = profile?.firstName
    ? `${profile.firstName}${profile.lastName ? ' ' + profile.lastName : ''}`
    : user?.firstName || 'Teacher';

  // 跳转到所有课程页面
  const viewAllClasses = () => {
    router.push('/dashboard/teacher/classes');
  };

  // 计算最近的课程（占位功能）
  const getRecentLessons = () => {
    // TODO: 实现获取最近课程的逻辑
    return 'Today';
  };

  return (
    <div className="glass-dashboard-container teacher-dashboard">
      {/* 动态背景 */}
      <div className="glass-background">
        <div className="glass-bg-gradient-1"></div>
        <div className="glass-bg-gradient-2"></div>
        <div className="glass-bg-gradient-3"></div>
      </div>

      {/* 导航栏 */}
      <nav className="glass-nav">
        <div className="container">
          <div className="glass-nav-content">
            <div className="glass-nav-title">
              <div className="glass-nav-icon">
                <GraduationCap size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h1>Teacher Dashboard</h1>
                <p className="glass-nav-subtitle">Course Management System</p>
              </div>
            </div>
            <div className="glass-user-section">
              <CustomUserMenu
                afterSignOutUrl="/auth/sign-in"
                profile={profile}
              />
            </div>
          </div>
        </div>
      </nav>

      <main className="container glass-main">
        {/* 欢迎区域 */}
        <div className="glass-welcome-section">
          <div className="glass-welcome-content">
            <div className="glass-sparkle-icon">
              <Sparkles size={32} />
            </div>
            <div>
              <h2 className="glass-welcome-title">
                Welcome back, {displayName}! 👋
              </h2>
              <p className="glass-welcome-subtitle">
                Ready to inspire minds today? Manage your classes and create engaging content.
              </p>
            </div>
          </div>
        </div>

        {/* 快速统计卡片 - 可点击 */}
        <div className="glass-stats-grid">
          <div
            className="glass-stat-card glass-stat-card-1"
            onClick={viewAllClasses}
            style={{ cursor: 'pointer' }}
          >
            <div className="glass-stat-icon-wrapper">
              <BookOpen size={28} strokeWidth={2} />
            </div>
            <div className="glass-stat-content">
              <p className="glass-stat-label">Total Classes</p>
              <p className="glass-stat-value">{classes?.length || 0}</p>
              <div className="glass-stat-trend">
                <TrendingUp size={16} />
                <span>View All</span>
              </div>
            </div>
            <div className="glass-stat-decoration"></div>
          </div>

          <div
            className="glass-stat-card glass-stat-card-2"
            onClick={() => router.push('/dashboard/teacher/students')}
            style={{ cursor: 'pointer' }}
          >
            <div className="glass-stat-icon-wrapper">
              <Users size={28} strokeWidth={2} />
            </div>
            <div className="glass-stat-content">
              <p className="glass-stat-label">Total Students</p>
              <p className="glass-stat-value">
                {classes?.reduce((sum, c) => sum + c.students.length, 0) || 0}
              </p>
              <div className="glass-stat-trend">
                <Award size={16} />
                <span>View All</span>
              </div>
            </div>
            <div className="glass-stat-decoration"></div>
          </div>

          <div
            className="glass-stat-card glass-stat-card-3"
            onClick={() => router.push('/dashboard/teacher/schedule')}
            style={{ cursor: 'pointer' }}
          >
            <div className="glass-stat-icon-wrapper">
              <Clock size={28} strokeWidth={2} />
            </div>
            <div className="glass-stat-content">
              <p className="glass-stat-label">Recent Lessons</p>
              <p className="glass-stat-value">{getRecentLessons()}</p>
              <div className="glass-stat-trend">
                <div className="glass-pulse"></div>
                <span>View Schedule</span>
              </div>
            </div>
            <div className="glass-stat-decoration"></div>
          </div>
        </div>

        {/* 主要内容区域 - 两栏布局 */}
        <div className="glass-sections">
          {/* 创建班级部分 - 左侧 */}
          <section className="glass-section">
            <div className="glass-section-header">
              <div className="glass-section-title-group">
                <div className="glass-section-icon">
                  <Plus size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h2>Create Class Code</h2>
                  <p className="glass-section-subtitle">Generate a unique code for your new class</p>
                </div>
              </div>
            </div>

            <div className="glass-form-wrapper">
              <ClassCodeInput userRole="teacher" />
            </div>
          </section>

          {/* 任务追踪部分 - 右侧 */}
          <section className="glass-section">
            <div className="glass-section-header">
              <div className="glass-section-title-group">
                <div className="glass-section-icon">
                  <CheckSquare size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h2>Tasks Tracking</h2>
                  <p className="glass-section-subtitle">
                    Monitor student progress and upcoming deadlines
                  </p>
                </div>
              </div>
            </div>
            <div className="glass-tasks-wrapper">
              <TasksTracking />
            </div>
          </section>
        </div>
      </main>

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#a78bfa',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}