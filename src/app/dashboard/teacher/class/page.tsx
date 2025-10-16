'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { api } from '../../../../../convex/_generated/api.js';
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
  AlertCircle 
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
    <div className="dashboard-container">
      {/* 导航栏 */}
      <nav className="dashboard-nav">
        <div className="container">
          <div className="nav-content">
            <div className="nav-title">
              <GraduationCap size={32} className="nav-icon" />
              <h1>Teacher Dashboard</h1>
            </div>
            <UserButton />
          </div>
        </div>
      </nav>

      <main className="container dashboard-main">
        {/* 欢迎区域 */}
        <div className="welcome-section">
          <h2 className="welcome-title">
            Welcome back, {user?.firstName || 'Teacher'}! 👋
          </h2>
          <p className="welcome-subtitle">
            Manage your classes and create engaging tasks for your students
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper blue">
              <BookOpen size={24} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Classes</p>
              <p className="stat-value">{classes?.length || 0}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper green">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Students</p>
              <p className="stat-value">
                {classes?.reduce((sum, c) => sum + c.students.length, 0) || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="dashboard-sections">
          {/* 创建新班级部分 */}
          <section className="dashboard-section create-class-section">
            <div className="section-header">
              <div className="section-title-group">
                <Plus size={24} className="section-icon" />
                <h2>Create Class Code</h2>
              </div>
            </div>
            
            {feedback && (
              <div className={`feedback-message ${feedback.type}`}>
                {feedback.type === 'success' ? (
                  <CheckCircle size={20} />
                ) : (
                  <AlertCircle size={20} />
                )}
                <span>{feedback.message}</span>
              </div>
            )}
            
            <div className="form-group">
              <ClassCodeInput
                userRole="teacher"
                onClassCreated={handleClassCreated}
                isDisabled={isCreating}
              />
            </div>
          </section>

          {/* 班级列表部分 */}
          <section className="dashboard-section classes-section">
            <div className="section-header">
              <div className="section-title-group">
                <BookOpen size={24} className="section-icon" />
                <h2>Your Classes</h2>
              </div>
            </div>

            {classes === undefined ? (
              <div className="status-message loading">
                <div className="loading-spinner"></div>
                <p>Loading classes...</p>
              </div>
            ) : classes.length === 0 ? (
              <div className="empty-state">
                <BookOpen size={64} className="empty-icon" />
                <p className="empty-title">No classes yet</p>
                <p className="empty-subtitle">
                  Create your first class to get started!
                </p>
              </div>
            ) : (
              <div className="class-grid">
                {classes.map((classItem) => (
                  <div key={classItem._id} className="class-card">
                    <div className="class-card-header">
                      <div className="class-icon-wrapper">
                        <BookOpen size={32} />
                      </div>
                      <div className="class-info">
                        <h3 className="class-name">{classItem.name}</h3>
                        <div className="class-meta">
                          <span className="class-code-badge">
                            Code: {classItem.code}
                          </span>
                          <span className="student-count-badge">
                            <Users size={16} />
                            {classItem.students.length} student(s)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="class-card-actions">
                      <Button
                        onClick={() =>
                          router.push(
                            `/dashboard/teacher/class/${classItem._id}`
                          )
                        }
                        variant="outline"
                        className="action-button view-button"
                      >
                        <Eye size={18} />
                        View Details
                      </Button>
                      <Button
                        onClick={() => setCurrentClass(classItem._id)}
                        className="action-button create-button"
                      >
                        <FileText size={18} />
                        Create Task
                      </Button>
                    </div>

                    {currentClass === classItem._id && (
                      <div className="task-form-wrapper">
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
