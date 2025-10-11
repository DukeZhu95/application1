'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { api } from '../../../../convex/_generated/api';
import { ClassCodeInput } from '@/app/components/shared/class-code-input';
import { Button } from '@/app/components/ui/button';
import { CreateTaskForm } from '@/app/dashboard/teacher/create-task-form';
import { 
  GraduationCap, 
  Users, 
  Plus, 
  Eye, 
  FileText,
  BookOpen,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Award,
  Clock,
  Sparkles
} from 'lucide-react';

export default function TeacherDashboard() {
  const { user } = useUser();
  const [currentClass, setCurrentClass] = useState<string | null>(null);
  const router = useRouter();
  const classes = useQuery(api.classes.getTeacherClasses, {
    teacherId: user?.id || '',
  });
  const [className, setClassName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const createClass = useMutation(api.classes.createClass);

  const handleClassCreated = async (code: string) => {
    if (!user || !className.trim()) {
      setFeedback({
        type: 'error',
        message: 'Please enter a class name',
      });
      return;
    }

    setIsCreating(true);
    try {
      await createClass({
        code,
        teacherId: user.id,
        name: className.trim(),
      });

      setFeedback({
        type: 'success',
        message: `Class "${className}" created successfully with code: ${code}`,
      });
      setClassName('');
    } catch {
      setFeedback({
        type: 'error',
        message: 'Failed to create class. Please try again.',
      });
    } finally {
      setIsCreating(false);
    }
  };

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
              <UserButton />
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
                Welcome back, {user?.firstName || 'Teacher'}! 👋
              </h2>
              <p className="glass-welcome-subtitle">
                Ready to inspire minds today? Manage your classes and create engaging content.
              </p>
            </div>
          </div>
        </div>

        {/* 统计卡片网格 */}
        <div className="glass-stats-grid">
          <div className="glass-stat-card glass-stat-card-1">
            <div className="glass-stat-icon-wrapper">
              <BookOpen size={28} strokeWidth={2} />
            </div>
            <div className="glass-stat-content">
              <p className="glass-stat-label">Total Classes</p>
              <p className="glass-stat-value">{classes?.length || 0}</p>
              <div className="glass-stat-trend">
                <TrendingUp size={16} />
                <span>Active</span>
              </div>
            </div>
            <div className="glass-stat-decoration"></div>
          </div>

          <div className="glass-stat-card glass-stat-card-2">
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
                <span>Enrolled</span>
              </div>
            </div>
            <div className="glass-stat-decoration"></div>
          </div>

          <div className="glass-stat-card glass-stat-card-3">
            <div className="glass-stat-icon-wrapper">
              <Clock size={28} strokeWidth={2} />
            </div>
            <div className="glass-stat-content">
              <p className="glass-stat-label">Recent Activity</p>
              <p className="glass-stat-value">Live</p>
              <div className="glass-stat-trend">
                <div className="glass-pulse"></div>
                <span>Online</span>
              </div>
            </div>
            <div className="glass-stat-decoration"></div>
          </div>
        </div>

        <div className="glass-sections">
          {/* 创建班级部分 */}
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
            
            {feedback && (
              <div className={`glass-feedback ${feedback.type}`}>
                <div className="glass-feedback-icon">
                  {feedback.type === 'success' ? (
                    <CheckCircle size={20} strokeWidth={2.5} />
                  ) : (
                    <AlertCircle size={20} strokeWidth={2.5} />
                  )}
                </div>
                <span>{feedback.message}</span>
              </div>
            )}
            
            <div className="glass-form-wrapper">
              <ClassCodeInput
                userRole="teacher"
                onClassCreated={handleClassCreated}
                isDisabled={isCreating}
              />
            </div>
          </section>

          {/* 班级列表部分 */}
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
                  Create your first class above to start teaching!
                </p>
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
                        onClick={() => setCurrentClass(classItem._id)}
                        className="glass-action-btn glass-btn-create"
                      >
                        <FileText size={18} strokeWidth={2} />
                        <span>Create Task</span>
                      </Button>
                    </div>

                    {currentClass === classItem._id && (
                      <div className="glass-task-form-wrapper">
                        <CreateTaskForm
                          classId={classItem._id}
                          onClose={() => setCurrentClass(null)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
