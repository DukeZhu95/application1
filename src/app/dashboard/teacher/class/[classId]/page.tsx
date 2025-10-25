'use client';
import { useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { Button } from '@/app/components/ui/button';
import { Id } from '../../../../../../convex/_generated/dataModel';
import { TaskForm } from '@/app/dashboard/teacher/task-form';
import { TaskList } from '@/app/dashboard/teacher/task-list';
import {
  ArrowLeft,
  Users,
  Code2,
  BookOpen,
  FileText,
  Calendar,
  TrendingUp} from 'lucide-react';

export default function ClassDetailsPage() {
  const router = useRouter();
  const pathSegments = window.location.pathname.split('/');
  const classId = pathSegments[pathSegments.length - 1] as Id<'classrooms'>;

  const classroom = useQuery(api.classes.getClassById, {
    classId,
  });

  if (!classroom) {
    return (
      <div className="glass-class-detail-container">
        <div className="glass-detail-background">
          <div className="glass-detail-gradient-1"></div>
          <div className="glass-detail-gradient-2"></div>
          <div className="glass-detail-gradient-3"></div>
        </div>
        <div className="glass-detail-loading">
          <div className="glass-detail-loading-spinner"></div>
          <p>Loading class details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-class-detail-container">
      {/* 自定义滚动条样式 */}
      <style jsx>{`
        .glass-detail-tasks-wrapper::-webkit-scrollbar {
          width: 6px;
        }
        
        .glass-detail-tasks-wrapper::-webkit-scrollbar-track {
          background: rgba(139, 92, 246, 0.1);
          border-radius: 10px;
        }
        
        .glass-detail-tasks-wrapper::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 10px;
          transition: background 0.3s;
        }
        
        .glass-detail-tasks-wrapper::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>

      {/* 动态背景 */}
      <div className="glass-detail-background">
        <div className="glass-detail-gradient-1"></div>
        <div className="glass-detail-gradient-2"></div>
        <div className="glass-detail-gradient-3"></div>
      </div>

      <div className="glass-detail-main">
        {/* 顶部导航和标题 */}
        <div className="glass-detail-header">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="glass-detail-back-btn"
          >
            <ArrowLeft size={20} strokeWidth={2} />
            <span>Back to Dashboard</span>
          </Button>
        </div>

        {/* 课程信息卡片 */}
        <div className="glass-detail-class-info">
          <div className="glass-detail-class-icon">
            <BookOpen size={48} strokeWidth={2} />
            <div className="glass-detail-icon-glow"></div>
          </div>

          <div className="glass-detail-class-content">
            <div className="glass-detail-class-main">
              <h1 className="glass-detail-class-title">{classroom.name}</h1>
              <p className="glass-detail-class-subtitle">
                Manage your class, create tasks, and track student progress
              </p>
            </div>

            <div className="glass-detail-class-meta">
              <div className="glass-detail-meta-item glass-detail-meta-code">
                <Code2 size={20} strokeWidth={2} />
                <div>
                  <p className="glass-detail-meta-label">Class Code</p>
                  <p className="glass-detail-meta-value">{classroom.code}</p>
                </div>
              </div>

              <div className="glass-detail-meta-item glass-detail-meta-students">
                <Users size={20} strokeWidth={2} />
                <div>
                  <p className="glass-detail-meta-label">Enrolled Students</p>
                  <p className="glass-detail-meta-value">
                    {classroom.students.length} student(s)
                  </p>
                </div>
              </div>

              <div className="glass-detail-meta-item glass-detail-meta-status">
                <TrendingUp size={20} strokeWidth={2} />
                <div>
                  <p className="glass-detail-meta-label">Status</p>
                  <p className="glass-detail-meta-value">Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 主要内容区 */}
        <div className="glass-detail-content-grid">
          {/* 创建任务区域 */}
          <div className="glass-detail-section glass-detail-create-section">
            <div className="glass-detail-section-header">
              <div className="glass-detail-section-icon">
                <FileText size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="glass-detail-section-title">Create New Task</h2>
                <p className="glass-detail-section-subtitle">
                  Add assignments and activities for your students
                </p>
              </div>
            </div>
            <div className="glass-detail-form-wrapper">
              <TaskForm classId={classroom._id} />
            </div>
          </div>

          {/* 任务列表区域 */}
          <div className="glass-detail-section glass-detail-tasks-section">
            <div className="glass-detail-section-header">
              <div className="glass-detail-section-icon">
                <Calendar size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="glass-detail-section-title">Class Tasks</h2>
                <p className="glass-detail-section-subtitle">
                  View and manage all assignments
                </p>
              </div>
            </div>
            <div
              className="glass-detail-tasks-wrapper"
              style={{
                maxHeight: '500px',
                overflowY: 'auto',
                overflowX: 'hidden',
                paddingRight: '8px',
              }}
            >
              <TaskList classId={classroom._id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}