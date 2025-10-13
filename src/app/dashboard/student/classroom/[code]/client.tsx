'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { StudentTaskList } from '@/app/dashboard/student/task-list';
import { ClassroomHeader } from '@/app/dashboard/student/classroom-header';
import { 
  BookOpen, 
  Calendar, 
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  FileText
} from 'lucide-react';

interface ClassroomPageClientProps {
  code: string;
}

export default function ClassroomPageClient({
  code,
}: ClassroomPageClientProps) {
  const classroom = useQuery(api.classes.getClassInfo, { code });

  if (!classroom) {
    return (
      <div className="glass-student-classroom-container">
        <div className="glass-student-classroom-background">
          <div className="glass-student-classroom-gradient-1"></div>
          <div className="glass-student-classroom-gradient-2"></div>
          <div className="glass-student-classroom-gradient-3"></div>
        </div>
        <div className="glass-student-classroom-loading">
          <div className="glass-student-classroom-loading-spinner"></div>
          <p>Loading classroom...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-student-classroom-container">
      {/* 动态背景 */}
      <div className="glass-student-classroom-background">
        <div className="glass-student-classroom-gradient-1"></div>
        <div className="glass-student-classroom-gradient-2"></div>
        <div className="glass-student-classroom-gradient-3"></div>
      </div>

      {/* 使用现有的 Header 组件 */}
      <ClassroomHeader code={code} />

      <main className="glass-student-classroom-main">
        {/* 课程信息卡片 */}
        <div className="glass-student-classroom-info">
          <div className="glass-student-classroom-icon">
            <BookOpen size={48} strokeWidth={2} />
            <div className="glass-student-classroom-icon-glow"></div>
          </div>
          
          <div className="glass-student-classroom-content">
            <div className="glass-student-classroom-header-content">
              <h1 className="glass-student-classroom-title">{classroom.name}</h1>
              <p className="glass-student-classroom-subtitle">
                Track your assignments and stay on top of your learning
              </p>
            </div>

            <div className="glass-student-classroom-meta">
              <div className="glass-student-classroom-meta-item glass-student-meta-code">
                <FileText size={20} strokeWidth={2} />
                <div>
                  <p className="glass-student-classroom-meta-label">Class Code</p>
                  <p className="glass-student-classroom-meta-value">{code}</p>
                </div>
              </div>

              <div className="glass-student-classroom-meta-item glass-student-meta-teacher">
                <Users size={20} strokeWidth={2} />
                <div>
                  <p className="glass-student-classroom-meta-label">Teacher</p>
                  <p className="glass-student-classroom-meta-value">
                    {classroom.teacherId || 'Instructor'}
                  </p>
                </div>
              </div>

              <div className="glass-student-classroom-meta-item glass-student-meta-status">
                <CheckCircle size={20} strokeWidth={2} />
                <div>
                  <p className="glass-student-classroom-meta-label">Status</p>
                  <p className="glass-student-classroom-meta-value">Enrolled</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 快速统计 */}
        <div className="glass-student-classroom-stats">
          <div className="glass-student-classroom-stat-card glass-student-stat-1">
            <div className="glass-student-classroom-stat-icon">
              <Calendar size={24} strokeWidth={2} />
            </div>
            <div className="glass-student-classroom-stat-content">
              <p className="glass-student-classroom-stat-label">This Week</p>
              <p className="glass-student-classroom-stat-value">Tasks</p>
            </div>
          </div>

          <div className="glass-student-classroom-stat-card glass-student-stat-2">
            <div className="glass-student-classroom-stat-icon">
              <Clock size={24} strokeWidth={2} />
            </div>
            <div className="glass-student-classroom-stat-content">
              <p className="glass-student-classroom-stat-label">Pending</p>
              <p className="glass-student-classroom-stat-value">Review</p>
            </div>
          </div>

          <div className="glass-student-classroom-stat-card glass-student-stat-3">
            <div className="glass-student-classroom-stat-icon">
              <TrendingUp size={24} strokeWidth={2} />
            </div>
            <div className="glass-student-classroom-stat-content">
              <p className="glass-student-classroom-stat-label">Progress</p>
              <p className="glass-student-classroom-stat-value">On Track</p>
            </div>
          </div>
        </div>

        {/* 任务列表部分 */}
        <div className="glass-student-classroom-section">
          <div className="glass-student-classroom-section-header">
            <div className="glass-student-classroom-section-icon">
              <FileText size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="glass-student-classroom-section-title">
                Your Assignments
              </h2>
              <p className="glass-student-classroom-section-subtitle">
                View and complete your tasks
              </p>
            </div>
          </div>

          <div className="glass-student-classroom-tasks-wrapper">
            <StudentTaskList classroomId={classroom._id} classCode={code} />
          </div>
        </div>
      </main>
    </div>
  );
}
