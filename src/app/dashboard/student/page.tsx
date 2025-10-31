'use client';

import { JoinClassForm } from '@/app/dashboard/student/join-class-form';
import { RouteGuard } from '@/app/components/auth/route-guard';
import {
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
import { CurrentTasks } from './current-tasks';

export default function StudentDashboard() {
  const { user } = useUser();
  const router = useRouter();

  // 从 Convex 数据库获取学生的个人资料
  const profile = useQuery(
    api.students.getStudentProfile,
    user?.id ? { studentId: user.id } : 'skip'
  );

  // ✅ 获取学生的课程安排
  const schedules = useQuery(
    api.classroomSchedules.getStudentSchedules,
    user?.id ? { studentId: user.id } : 'skip'
  );

  // 获取显示的名字（优先使用数据库中的名字）
  const displayName = profile?.firstName
    ? `${profile.firstName}${profile.lastName ? ' ' + profile.lastName : ''}`
    : user?.firstName || 'Student';

  // ✅ 计算课程表信息
  const getTimetableInfo = () => {
    if (!schedules || schedules.length === 0) {
      return {
        label: 'No classes',
        value: 'Join a class',
      };
    }

    const today = new Date();
    const currentDay = today.getDay();
    const currentTime = today.getHours() * 60 + today.getMinutes(); // 转换为分钟

    // 获取今天的课程
    const todayClasses = schedules.filter(schedule =>
      schedule.daysOfWeek?.includes(currentDay)
    );

    // 如果今天有课
    if (todayClasses.length > 0) {
      // 查找下一节课
      const upcomingClass = todayClasses.find(schedule => {
        const [hours, minutes] = schedule.startTime.split(':').map(Number);
        const classTime = hours * 60 + minutes;
        return classTime > currentTime;
      });

      if (upcomingClass) {
        // 有即将开始的课
        return {
          label: 'Next class',
          value: `${upcomingClass.startTime}`,
        };
      } else {
        // 今天的课都结束了
        return {
          label: 'Today',
          value: `${todayClasses.length} completed`,
        };
      }
    }

    // 今天没课，显示本周课程数
    const daysOfWeek = [0, 1, 2, 3, 4, 5, 6];
    let weeklyClasses = 0;

    daysOfWeek.forEach(day => {
      const dayClasses = schedules.filter(schedule =>
        schedule.daysOfWeek?.includes(day)
      );
      weeklyClasses += dayClasses.length;
    });

    return {
      label: 'This week',
      value: `${weeklyClasses} classes`,
    };
  };

  const timetableInfo = getTimetableInfo();

  // 跳转到所有班级页面
  const viewAllClasses = () => {
    router.push('/dashboard/student/classes');
  };

  // 查看课程表
  const viewTimetable = () => {
    router.push('/dashboard/student/timetable');
  };

  // 查看成绩（占位功能）
  const viewGrades = () => {
    alert('Grades feature coming soon! 📊\nView all your grades and progress here');
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
          {/* 欢迎区域 */}
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
                <p className="glass-student-stat-mini-label">Enrolled classes</p>
                <p className="glass-student-stat-mini-value">View All</p>
              </div>
            </div>

            {/* ✅ 修改：显示基于课程表的真实信息 */}
            <div
              className="glass-student-stat-mini glass-student-stat-2"
              onClick={viewTimetable}
              style={{ cursor: 'pointer' }}
            >
              <div className="glass-student-stat-mini-icon">
                <Calendar size={24} strokeWidth={2} />
              </div>
              <div className="glass-student-stat-mini-content">
                <p className="glass-student-stat-mini-label">{timetableInfo.label}</p>
                <p className="glass-student-stat-mini-value">{timetableInfo.value}</p>
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
                <CurrentTasks />
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