'use client';

import { useUser } from '@clerk/nextjs';
// import { useQuery } from 'convex/react';
//  import { api } from '../../../../convex/_generated/api';
// import { formatDate } from '@/lib/utils';
// import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Clock, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

// 临时模拟数据（因为需要创建新的 Convex 查询函数）
const mockTasks = [
  {
    _id: '1',
    title: 'Guitar Practice: Chord Transitions',
    description: 'Practice smooth transitions between G, C, and D chords',
    dueDate: Date.now() + 3 * 24 * 60 * 60 * 1000, // 3天后
    classCode: 'COM555',
    className: 'Guitar Basics',
    status: 'pending',
  },
  {
    _id: '2',
    title: 'Music Theory Assignment',
    description: 'Complete Chapter 3 exercises on scales',
    dueDate: Date.now() + 5 * 24 * 60 * 60 * 1000, // 5天后
    classCode: 'TES123',
    className: 'Music Theory 101',
    status: 'in-progress',
  },
  {
    _id: '3',
    title: 'Submit Practice Recording',
    description: 'Record and submit your practice session',
    dueDate: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1天前（逾期）
    classCode: 'GTR100',
    className: 'Advanced Guitar',
    status: 'overdue',
  },
];

export function AllTasksList() {
  const { user } = useUser();
  const router = useRouter();

  // TODO: 创建 Convex 查询函数来获取所有任务
  // const tasks = useQuery(
  //   api.tasks.getStudentAllTasks,
  //   user?.id ? { studentId: user.id } : 'skip'
  // );

  // 暂时使用模拟数据
  const tasks = mockTasks;

  if (!user?.id) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        Please sign in to view your tasks.
      </div>
    );
  }

  // 计算剩余天数
  const getDaysRemaining = (dueDate: number) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 获取状态样式
  const getStatusStyle = (dueDate: number) => {
    const days = getDaysRemaining(dueDate);
    if (days < 0) {
      return {
        color: '#ef4444',
        text: `Overdue by ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''}`,
        icon: <AlertCircle size={18} style={{ color: '#ef4444' }} />,
      };
    } else if (days === 0) {
      return {
        color: '#f59e0b',
        text: 'Due today',
        icon: <Clock size={18} style={{ color: '#f59e0b' }} />,
      };
    } else if (days <= 2) {
      return {
        color: '#f59e0b',
        text: `Due in ${days} day${days !== 1 ? 's' : ''}`,
        icon: <Clock size={18} style={{ color: '#f59e0b' }} />,
      };
    } else {
      return {
        color: '#6b7280',
        text: `Due in ${days} day${days !== 1 ? 's' : ''}`,
        icon: <Clock size={18} style={{ color: '#6b7280' }} />,
      };
    }
  };

  if (tasks.length === 0) {
    return (
      <div style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        color: '#6b7280',
      }}>
        <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem', fontWeight: '600' }}>
          No tasks yet
        </p>
        <p style={{ fontSize: '0.875rem' }}>
          Your upcoming assignments will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="all-tasks-container">
      <div className="tasks-grid" style={{ display: 'grid', gap: '1rem' }}>
        {tasks.map((task) => {
          const statusInfo = getStatusStyle(task.dueDate);

          return (
            <div
              key={task._id}
              className="task-item"
              style={{
                background: 'rgba(255, 255, 255, 0.6)',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
              }}
              onClick={() => {
                router.push(`/dashboard/student/classroom/${task.classCode}/task/${task._id}`);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '0.75rem',
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '700',
                  color: '#1a202c',
                  margin: 0,
                  flex: 1,
                }}>
                  {task.title}
                </h3>
                {statusInfo.icon}
              </div>

              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                margin: '0 0 0.75rem 0',
                lineHeight: '1.5',
              }}>
                {task.description}
              </p>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}>
                <span style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  fontWeight: '500',
                }}>
                  {task.className} ({task.classCode})
                </span>

                <span style={{
                  fontSize: '0.875rem',
                  color: statusInfo.color,
                  fontWeight: '600',
                }}>
                  {statusInfo.text}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}