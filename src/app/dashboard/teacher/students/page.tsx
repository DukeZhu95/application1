'use client';

import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { api } from '../../../../../convex/_generated/api';
import { CustomUserMenu } from '@/app/dashboard/teacher/custom-user-menu';
import {
  GraduationCap,
  ArrowLeft,
  Users,
  BookOpen,
  Mail
} from 'lucide-react';
import '@/styles/components/teacher-dashboard-glass.css';

// 定义类型接口
interface ClassItem {
  _id: string;
  _creationTime: number;
  name?: string;
  description?: string;
  teacherName?: string;
  code: string;
  teacherId: string;
  createdAt: number;
  students: Array<{
    studentId: string;
    joinedAt: number;
    status: string;
  }>;
}

interface StudentWithClasses {
  studentId: string;
  joinedAt: number;
  classes: ClassItem[];
}

export default function AllStudentsPage() {
  const router = useRouter();
  const { user } = useUser();

  const classes = useQuery(
    api.classes.getTeacherClasses,
    user?.id ? { teacherId: user.id } : 'skip',
  );

  const profile = useQuery(
    api.teachers.getTeacherProfile,
    user?.id ? { teacherId: user.id } : 'skip',
  );

  // 汇总所有学生信息
  const getAllStudents = (): StudentWithClasses[] => {
    if (!classes) return [];

    const studentMap = new Map<string, StudentWithClasses>();

    classes.forEach((classItem) => {
      classItem.students.forEach((student) => {
        if (!studentMap.has(student.studentId)) {
          studentMap.set(student.studentId, {
            studentId: student.studentId,
            joinedAt: student.joinedAt,
            classes: [classItem],
          });
        } else {
          const existing = studentMap.get(student.studentId);
          if (existing) {
            existing.classes.push(classItem);
          }
        }
      });
    });

    return Array.from(studentMap.values());
  };

  const allStudents = getAllStudents();

  // 获取学生详细信息（需要创建API）
  const studentsWithProfiles = allStudents.map((student) => {
    // 这里可以添加获取学生profile的逻辑
    // const profile = useQuery(api.students.getStudentProfile, { studentId: student.studentId });
    return student;
  });

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
                  <h1>All Students</h1>
                  <p className="glass-nav-subtitle">Student Directory</p>
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
              style={{ background: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)' }}
            >
              <Users size={32} />
            </div>
            <div>
              <h2 className="glass-welcome-title">
                All Students 👨‍🎓
              </h2>
              <p className="glass-welcome-subtitle">
                View all students enrolled in your classes. Total: {allStudents.length}
              </p>
            </div>
          </div>
        </div>

        {/* 学生列表 */}
        <section className="glass-section">
          <div className="glass-section-header">
            <div className="glass-section-title-group">
              <div className="glass-section-icon">
                <Users size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h2>Student Directory</h2>
                <p className="glass-section-subtitle">All students across your classes</p>
              </div>
            </div>
          </div>

          {classes === undefined ? (
            <div className="glass-loading">
              <div className="glass-loading-spinner"></div>
              <p>Loading students...</p>
            </div>
          ) : allStudents.length === 0 ? (
            <div className="glass-empty-state">
              <div className="glass-empty-icon">
                <Users size={72} strokeWidth={1.5} />
              </div>
              <h3 className="glass-empty-title">No students yet</h3>
              <p className="glass-empty-subtitle">
                Students will appear here once they join your classes
              </p>
            </div>
          ) : (
            <div className="student-grid">
              {studentsWithProfiles.map((student, index) => (
                <div
                  key={student.studentId}
                  className="student-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* 学生头像 */}
                  <div className="student-avatar-wrapper">
                    <div className="student-avatar">
                      {student.studentId.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  {/* 学生信息 */}
                  <div className="student-info">
                    <h3 className="student-name">
                      Student {student.studentId.slice(0, 8)}
                    </h3>
                    <p className="student-id">
                      <Mail size={14} />
                      ID: {student.studentId.slice(0, 12)}...
                    </p>
                  </div>

                  {/* 课程列表 */}
                  <div className="student-classes">
                    <div className="student-classes-header">
                      <BookOpen size={16} />
                      <span>Enrolled Classes ({student.classes.length})</span>
                    </div>
                    <div className="student-classes-list">
                      {student.classes.map((classItem: ClassItem) => (
                        <div
                          key={classItem._id}
                          className="student-class-badge"
                          onClick={() => router.push(`/dashboard/teacher/class/${classItem._id}`)}
                        >
                          <BookOpen size={12} />
                          <span>{classItem.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 加入日期 */}
                  <div className="student-joined">
                    Joined: {new Date(student.joinedAt).toLocaleDateString()}
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