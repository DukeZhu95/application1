'use client';

import { UserButton } from '@clerk/nextjs';
import { JoinClassForm } from '@/app/dashboard/student/join-class-form';
import { StudentClassList } from '@/app/dashboard/student/class-list';
import { RouteGuard } from '@/app/components/auth/route-guard';
import {
  BookOpen,
  Plus,
  GraduationCap,
  Sparkles,
  Library,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { CustomUserMenu } from '@/app/dashboard/student/custom-user-menu';

export default function StudentDashboard() {
  const { user } = useUser();

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
                <CustomUserMenu afterSignOutUrl="/auth/sign-in" />
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
                  Welcome back, {user?.firstName || 'Student'}! 🎓
                </h2>
                <p className="glass-student-welcome-subtitle">
                  Ready to learn something new today? Join classes and track your progress.
                </p>
              </div>
            </div>
          </div>

          {/* 快速统计卡片 */}
          <div className="glass-student-quick-stats">
            <div className="glass-student-stat-mini glass-student-stat-1">
              <div className="glass-student-stat-mini-icon">
                <Library size={24} strokeWidth={2} />
              </div>
              <div className="glass-student-stat-mini-content">
                <p className="glass-student-stat-mini-label">Enrolled</p>
                <p className="glass-student-stat-mini-value">Classes</p>
              </div>
            </div>

            <div className="glass-student-stat-mini glass-student-stat-2">
              <div className="glass-student-stat-mini-icon">
                <Calendar size={24} strokeWidth={2} />
              </div>
              <div className="glass-student-stat-mini-content">
                <p className="glass-student-stat-mini-label">This Week</p>
                <p className="glass-student-stat-mini-value">Active</p>
              </div>
            </div>

            <div className="glass-student-stat-mini glass-student-stat-3">
              <div className="glass-student-stat-mini-icon">
                <TrendingUp size={24} strokeWidth={2} />
              </div>
              <div className="glass-student-stat-mini-content">
                <p className="glass-student-stat-mini-label">Progress</p>
                <p className="glass-student-stat-mini-value">On Track</p>
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

            {/* 班级列表部分 */}
            <section className="glass-student-section glass-student-classes-section">
              <div className="glass-student-section-header">
                <div className="glass-student-section-title-group">
                  <div className="glass-student-section-icon">
                    <BookOpen size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2>My classes</h2>
                    <p className="glass-student-section-subtitle">
                      View all your enrolled classes
                    </p>
                  </div>
                </div>
              </div>
              <div className="glass-student-classes-wrapper">
                <StudentClassList />
              </div>
            </section>
          </div>
        </main>
      </div>
    </RouteGuard>
  );
}