'use client';

import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { api } from '../../../../../convex/_generated/api';
import { CustomUserMenu } from '@/app/dashboard/teacher/custom-user-menu';
import { Button } from '@/app/components/ui/button';
import {
  GraduationCap,
  ArrowLeft,
  BookOpen,
  Users,
  Eye,
  FileText
} from 'lucide-react';
import '@/styles/components/teacher-dashboard-glass.css';

export default function AllClassesPage() {
  const router = useRouter();
  const { user } = useUser();

  const classes = useQuery(
    api.classes.getTeacherClasses,
    user?.id ? { teacherId: user.id } : 'skip'
  );

  const profile = useQuery(
    api.teachers.getTeacherProfile,
    user?.id ? { teacherId: user.id } : 'skip'
  );

  return (
    <div className="glass-dashboard-container">
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => router.push('/dashboard/teacher')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  padding: '0.75rem 1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  color: '#1a202c',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                  e.currentTarget.style.transform = 'translateX(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <ArrowLeft size={20} />
                Back to Dashboard
              </button>

              <div className="glass-nav-title" style={{ marginLeft: '1rem' }}>
                <div className="glass-nav-icon">
                  <GraduationCap size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <h1>My Classes</h1>
                  <p className="glass-nav-subtitle">All Teaching Spaces</p>
                </div>
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

      {/* 主要内容 */}
      <main className="container glass-main">
        {/* 页面标题 */}
        <div className="glass-welcome-section">
          <div className="glass-welcome-content">
            <div
              className="glass-sparkle-icon"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              <BookOpen size={32} />
            </div>
            <div>
              <h2 className="glass-welcome-title">
                My Classes 📚
              </h2>
              <p className="glass-welcome-subtitle">
                View and manage all your teaching spaces. Click on any class to see details and create tasks.
              </p>
            </div>
          </div>
        </div>

        {/* 班级列表 */}
        <section className="glass-section">
          <div className="glass-section-header">
            <div className="glass-section-title-group">
              <div className="glass-section-icon">
                <BookOpen size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h2>Your Classes</h2>
                <p className="glass-section-subtitle">Manage and organize your teaching spaces</p>
              </div>
            </div>
          </div>

          {classes === undefined ? (
            <div className="glass-loading">
              <div className="glass-loading-spinner"></div>
              <p>Loading your classes...</p>
            </div>
          ) : classes.length === 0 ? (
            <div className="glass-empty-state">
              <div className="glass-empty-icon">
                <BookOpen size={72} strokeWidth={1.5} />
              </div>
              <h3 className="glass-empty-title">No classes yet</h3>
              <p className="glass-empty-subtitle">
                Create your first class from the dashboard to start teaching!
              </p>
              <button
                onClick={() => router.push('/dashboard/teacher')}
                style={{
                  marginTop: '1.5rem',
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(102, 126, 234, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div className="glass-class-grid">
              {classes.map((classItem, index) => (
                <div
                  key={classItem._id}
                  className="glass-class-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="glass-card-glow"></div>

                  <div className="glass-class-header">
                    <div className="glass-class-icon-wrapper">
                      <BookOpen size={32} strokeWidth={2} />
                      <div className="glass-icon-glow"></div>
                    </div>
                    <div className="glass-class-info">
                      <h3 className="glass-class-name">{classItem.name}</h3>
                      <div className="glass-class-meta">
                        <span className="glass-badge glass-badge-code">
                          {classItem.code}
                        </span>
                        <span className="glass-badge glass-badge-students">
                          <Users size={14} strokeWidth={2.5} />
                          {classItem.students.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="glass-class-actions">
                    <Button
                      onClick={() =>
                        router.push(
                          `/dashboard/teacher/class/${classItem._id}`
                        )
                      }
                      variant="outline"
                      className="glass-action-btn glass-btn-view"
                    >
                      <Eye size={18} strokeWidth={2} />
                      <span>View Details</span>
                    </Button>
                    <Button
                      onClick={() =>
                        router.push(
                          `/dashboard/teacher/class/${classItem._id}/create-task`
                        )
                      }
                      className="glass-action-btn glass-btn-create"
                    >
                      <FileText size={18} strokeWidth={2} />
                      <span>Create Task</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}