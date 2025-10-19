'use client';

import { JoinClassForm } from '@/app/dashboard/student/join-class-form';
import { AllTasksList } from '@/app/dashboard/student/all-tasks';
import { RouteGuard } from '@/app/components/auth/route-guard';
import {
  // BookOpen,
  Plus,
  GraduationCap,
  Sparkles,
  Library,
  Calendar,
  TrendingUp,
  CheckSquare
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { CustomUserMenu } from '@/app/dashboard/student/custom-user-menu';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function StudentDashboard() {
  const { user } = useUser();
  const router = useRouter();

  // 从 Convex 数据库获取学生的个人资料
  const profile = useQuery(
    api.students.getStudentProfile,
    user?.id ? { studentId: user.id } : 'skip'
  );

  // 获取显示的名字（优先使用数据库中的名字）
  const displayName = profile?.firstName
    ? `${profile.firstName}${profile.lastName ? ' ' + profile.lastName : ''}`
    : user?.firstName || 'Student';

  // 计算当前是学期的第几周（假设学期从2025年2月1日开始）
  const calculateWeekNumber = () => {
    const semesterStart = new Date('2025-02-01'); // 可以根据实际情况调整
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - semesterStart.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weekNumber = Math.ceil(diffDays / 7);
    return weekNumber;
  };

  const currentWeek = calculateWeekNumber();

  // 跳转到所有班级页面
  const viewAllClasses = () => {
    router.push('/dashboard/student/classes');
  };

  // 查看课程表（占位功能）
  const viewTimetable = () => {
    alert('Timetable feature coming soon! 📅\nWeek ' + currentWeek + ' of semester');
    // TODO: 实现课程表功能或跳转到课程表页面
  };

  // 查看成绩（占位功能）
  const viewGrades = () => {
    alert('Grades feature coming soon! 📊\nView all your grades and progress here');
    // TODO: 实现成绩查看功能或跳转到成绩页面
  };

  return (
    <RouteGuard>
      <div className="glass-student-container">
        {/* 动态背景 */}
        <div className="glass-student-background">
          <div className="glass-student-gradient-1"></div>
          <div className="glass-student-gradient-2"></div>
          <div className="glass-student-gradient-3"></div>
        </div>

        {/* 导航栏 */}
        <nav className="glass-student-nav">
          <div className="container">
            <div className="glass-student-nav-content">
              <div className="glass-student-nav-title">
                <div className="glass-student-nav-icon">
                  <GraduationCap size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <h1>Student Dashboard</h1>
                  <p className="glass-student-nav-subtitle">Learning Management Portal</p>
                </div>
              </div>
              <div className="glass-student-user-section">
                {/* 将 profile 传递给 CustomUserMenu 以显示自定义头像 */}
                <CustomUserMenu
                  afterSignOutUrl="/auth/sign-in"
                  profile={profile}
                />
              </div>
            </div>
          </div>
        </nav>

        {/* 主要内容 */}
        <main className="container glass-student-main">
          {/* 欢迎区域 - 使用数据库中的名字 */}
          <div className="glass-student-welcome">
            <div className="glass-student-welcome-content">
              <div className="glass-student-sparkle-icon">
                <Sparkles size={32} />
              </div>
              <div>
                <h2 className="glass-student-welcome-title">
                  Welcome back, {displayName}! 🎓
                </h2>
                <p className="glass-student-welcome-subtitle">
                  Ready to learn something new today? Join classes and track your progress.
                </p>
              </div>
            </div>
          </div>

          {/* 快速统计卡片 */}
          <div className="glass-student-quick-stats">
            <div
              className="glass-student-stat-mini glass-student-stat-1"
              onClick={viewAllClasses}
              style={{ cursor: 'pointer' }}
            >
              <div className="glass-student-stat-mini-icon">
                <Library size={24} strokeWidth={2} />
              </div>
              <div className="glass-student-stat-mini-content">
                <p className="glass-student-stat-mini-label">Enrolled</p>
                <p className="glass-student-stat-mini-value">Classes</p>
              </div>
            </div>

            <div
              className="glass-student-stat-mini glass-student-stat-2"
              onClick={viewTimetable}
              style={{ cursor: 'pointer' }}
            >
              <div className="glass-student-stat-mini-icon">
                <Calendar size={24} strokeWidth={2} />
              </div>
              <div className="glass-student-stat-mini-content">
                <p className="glass-student-stat-mini-label">Time Table</p>
                <p className="glass-student-stat-mini-value">Week {currentWeek}</p>
              </div>
            </div>

            <div
              className="glass-student-stat-mini glass-student-stat-3"
              onClick={viewGrades}
              style={{ cursor: 'pointer' }}
            >
              <div className="glass-student-stat-mini-icon">
                <TrendingUp size={24} strokeWidth={2} />
              </div>
              <div className="glass-student-stat-mini-content">
                <p className="glass-student-stat-mini-label">Grade</p>
                <p className="glass-student-stat-mini-value">View All</p>
              </div>
            </div>
          </div>

          <div className="glass-student-grid">
            {/* 加入班级部分 */}
            <section className="glass-student-section glass-student-join-section">
              <div className="glass-student-section-header">
                <div className="glass-student-section-title-group">
                  <div className="glass-student-section-icon">
                    <Plus size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2>Join a class</h2>
                    <p className="glass-student-section-subtitle">
                      Enter your class code to get started
                    </p>
                  </div>
                </div>
              </div>
              <div className="glass-student-form-wrapper">
                <JoinClassForm />
              </div>
            </section>

            {/* 所有任务部分 - 替换原来的班级列表 */}
            <section className="glass-student-section glass-student-tasks-section">
              <div className="glass-student-section-header">
                <div className="glass-student-section-title-group">
                  <div className="glass-student-section-icon">
                    <CheckSquare size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2>Current Tasks</h2>
                    <p className="glass-student-section-subtitle">
                      Track your upcoming assignments and deadlines
                    </p>
                  </div>
                </div>
              </div>
              <div className="glass-student-tasks-wrapper">
                <AllTasksList />
              </div>
            </section>
          </div>
        </main>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
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
    </RouteGuard>
  );
}