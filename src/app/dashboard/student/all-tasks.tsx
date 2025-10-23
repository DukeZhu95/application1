'use client';

import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Clock, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AllTasksList() {
  const { user } = useUser();
  const router = useRouter();

  // 从数据库获取真实任务
  const tasks = useQuery(
    api.tasks.getStudentTasks,
    user?.id ? { userId: user.id } : 'skip'
  );

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

  // 加载状态
  if (tasks === undefined) {
    return (
      <div style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        color: '#6b7280',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid rgba(79, 172, 254, 0.2)',
          borderTopColor: '#4facfe',
          borderRadius: '50%',
          margin: '0 auto 1rem',
          animation: 'spin 1s linear infinite',
        }} />
        <p>Loading tasks...</p>
        <style jsx>{`
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `}</style>
      </div>
    );
  }

  // 计算剩余天数
  const getDaysRemaining = (dueDate: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 按截止日期排序（越紧急的越靠前）
  const sortedTasks = [...tasks].sort((a, b) => {
    // 如果没有截止日期，排在最后
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;

    const daysA = getDaysRemaining(a.dueDate);
    const daysB = getDaysRemaining(b.dueDate);

    // 逾期的任务排在最前面
    if (daysA < 0 && daysB >= 0) return -1;
    if (daysA >= 0 && daysB < 0) return 1;

    // 如果都逾期，越逾期的越靠前
    if (daysA < 0 && daysB < 0) return daysA - daysB;

    // 如果都未逾期，截止日期越近的越靠前
    return daysA - daysB;
  });

  // 获取状态样式
  const getStatusStyle = (dueDate?: number) => {
    if (!dueDate) {
      return {
        color: '#6b7280',
        text: 'No deadline',
        icon: <Clock size={18} style={{ color: '#6b7280' }} />,
        bgColor: 'rgba(255, 255, 255, 0.6)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
      };
    }

    const days = getDaysRemaining(dueDate);
    if (days < 0) {
      return {
        color: '#ef4444',
        text: `Overdue by ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''}`,
        icon: <AlertCircle size={18} style={{ color: '#ef4444' }} />,
        bgColor: 'rgba(239, 68, 68, 0.08)',
        borderColor: 'rgba(239, 68, 68, 0.25)',
      };
    } else if (days === 0) {
      return {
        color: '#f59e0b',
        text: 'Due today',
        icon: <Clock size={18} style={{ color: '#f59e0b' }} />,
        bgColor: 'rgba(245, 158, 11, 0.08)',
        borderColor: 'rgba(245, 158, 11, 0.25)',
      };
    } else if (days <= 2) {
      return {
        color: '#f59e0b',
        text: `Due in ${days} day${days !== 1 ? 's' : ''}`,
        icon: <Clock size={18} style={{ color: '#f59e0b' }} />,
        bgColor: 'rgba(245, 158, 11, 0.08)',
        borderColor: 'rgba(245, 158, 11, 0.25)',
      };
    } else {
      return {
        color: '#6b7280',
        text: `Due in ${days} day${days !== 1 ? 's' : ''}`,
        icon: <Clock size={18} style={{ color: '#6b7280' }} />,
        bgColor: 'rgba(255, 255, 255, 0.6)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
      };
    }
  };

  if (sortedTasks.length === 0) {
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
    <div
      className="all-tasks-container"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        className="tasks-scroll-container"
        style={{
          maxHeight: '355px',
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingRight: '0.5rem',
        }}
      >
        <div
          className="tasks-grid"
          style={{
            display: 'grid',
            gap: '1rem',
          }}
        >
          {sortedTasks.map((task) => {
            const statusInfo = getStatusStyle(task.dueDate);

            return (
              <div
                key={task._id}
                className="task-item"
                style={{
                  background: statusInfo.bgColor,
                  borderRadius: '16px',
                  padding: '1.5rem',
                  border: `1px solid ${statusInfo.borderColor}`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  // 导航到任务详情页
                  router.push(`/dashboard/student/task/${task._id}`);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = statusInfo.bgColor;
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
                  flexWrap: 'wrap',
                }}>
                  <span style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    fontWeight: '500',
                  }}>
                    {/* 显示课程名称 - 如果有的话 */}
                    {task.className || 'Classroom'}
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

      <div
        style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: 'rgba(79, 172, 254, 0.08)',
          borderRadius: '8px',
          textAlign: 'center',
        }}
      >
        <p style={{
          margin: 0,
          fontSize: '0.875rem',
          color: '#4facfe',
          fontWeight: '600',
        }}>
          {sortedTasks.length} {sortedTasks.length === 1 ? 'task' : 'tasks'} total
          {sortedTasks.filter(t => t.dueDate && getDaysRemaining(t.dueDate) < 0).length > 0 && (
            <span style={{ color: '#ef4444', marginLeft: '0.5rem' }}>
              • {sortedTasks.filter(t => t.dueDate && getDaysRemaining(t.dueDate) < 0).length} overdue
            </span>
          )}
        </p>
      </div>

      <style jsx>{`
          .tasks-scroll-container::-webkit-scrollbar {
              width: 8px;
          }
          .tasks-scroll-container::-webkit-scrollbar-track {
              background: rgba(0, 0, 0, 0.05);
              border-radius: 10px;
          }
          .tasks-scroll-container::-webkit-scrollbar-thumb {
              background: rgba(79, 172, 254, 0.3);
              border-radius: 10px;
              transition: background 0.3s;
          }
          .tasks-scroll-container::-webkit-scrollbar-thumb:hover {
              background: rgba(79, 172, 254, 0.5);
          }
          .tasks-scroll-container {
              scrollbar-width: thin;
              scrollbar-color: rgba(79, 172, 254, 0.3) rgba(0, 0, 0, 0.05);
          }
      `}</style>
    </div>
  );
}