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

  // ✅ 获取学生的班级列表（用于获取课程名）
  const classrooms = useQuery(
    api.classes.getStudentClassrooms,
    user?.id ? { studentId: user.id } : 'skip'
  );

  // 获取显示的名字（优先使用数据库中的名字）
  const displayName = profile?.firstName
    ? `${profile.firstName}${profile.lastName ? ' ' + profile.lastName : ''}`
    : user?.firstName || 'Student';

  // ✅ 计算课程表信息 - 显示"星期几 + 课程名"
  const getTimetableInfo = () => {
    if (!schedules || schedules.length === 0 || !classrooms || classrooms.length === 0) {
      return {
        label: 'No classes',
        value: 'Join a class',
      };
    }

    const now = new Date();
    const currentDay = now.getDay(); // 0-6 (Sunday-Saturday)
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // 解析时间字符串为分钟数
    const parseTime = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    // 星期几的名称
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // 获取所有未来的课程（包括今天和未来7天）
    const allUpcomingClasses: Array<{
      schedule: any;
      classroom: any;
      dayOfWeek: number;
      startTimeMinutes: number;
      daysUntil: number;
    }> = [];

    schedules.forEach((schedule) => {
      const classroom = classrooms.find((c) => c._id === schedule.classroomId);
      if (!classroom) return;

      schedule.daysOfWeek.forEach((dayOfWeek: number) => {
        const startTimeMinutes = parseTime(schedule.startTime);

        // 计算到这节课还有多少天
        let daysUntil = dayOfWeek - currentDay;

        // 如果是今天的课
        if (daysUntil === 0) {
          // 如果课程还没开始，加入列表
          if (startTimeMinutes > currentTime) {
            allUpcomingClasses.push({
              schedule,
              classroom,
              dayOfWeek,
              startTimeMinutes,
              daysUntil: 0,
            });
          }
        }
        // 如果是本周未来的课
        else if (daysUntil > 0) {
          allUpcomingClasses.push({
            schedule,
            classroom,
            dayOfWeek,
            startTimeMinutes,
            daysUntil,
          });
        }
        // 如果是下周的课
        else {
          daysUntil += 7;
          allUpcomingClasses.push({
            schedule,
            classroom,
            dayOfWeek,
            startTimeMinutes,
            daysUntil,
          });
        }
      });
    });

    // 按照时间排序（先按天数，再按时间）
    allUpcomingClasses.sort((a, b) => {
      if (a.daysUntil !== b.daysUntil) {
        return a.daysUntil - b.daysUntil;
      }
      return a.startTimeMinutes - b.startTimeMinutes;
    });

    // 获取最近的课程
    const nextClass = allUpcomingClasses[0];

    if (!nextClass) {
      return {
        label: 'No classes',
        value: 'This week',
      };
    }

    // 格式化显示
    const dayName = dayNames[nextClass.dayOfWeek];
    const courseName = nextClass.classroom.courseName || nextClass.classroom.name;

    if (nextClass.daysUntil === 0) {
      // 今天的课程
      return {
        label: 'Today',
        value: courseName,
      };
    } else if (nextClass.daysUntil === 1) {
      // 明天的课程
      return {
        label: 'Tomorrow',
        value: courseName,
      };
    } else {
      // 未来几天的课程
      return {
        label: dayName,
        value: courseName,
      };
    }
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