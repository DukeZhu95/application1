/**
 * Current Tasks 组件
 * 显示学生dashboard上的当前任务列表
 */

'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle2, Star, AlertCircle } from 'lucide-react';
import { Id } from '../../../../convex/_generated/dataModel';

// ✅ 完整的任务类型定义 - 匹配 getStudentTasks API 返回的所有字段
interface Task {
  _id: Id<'tasks'>;
  _creationTime: number;
  title: string;
  description: string;
  status: string;
  createdAt: number;
  teacherId: string;
  classroomId: Id<'classrooms'>;
  className?: string;
  classCode?: string;
  dueDate?: number;
  isSubmitted: boolean;
  submissionStatus?: string | null;
  grade?: number | null;
  feedback?: string | null;
  attachments?: Array<{
    name: string;
    url: string;
    size: number;
  }>;
  storageId?: Id<'_storage'>;
  attachmentName?: string;
  attachmentUrl?: string;
  storageIds?: Id<'_storage'>[];
  attachmentNames?: string[];
  attachmentUrls?: string[];
}

export function CurrentTasks() {
  const { user } = useUser();
  const router = useRouter();

  const allTasks = useQuery(
    api.tasks.getStudentTasks,
    user?.id ? { userId: user.id } : 'skip'
  );

  // 📌 计算剩余天数
  const getDaysRemaining = (dueDate: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 📌 格式化截止日期显示
  const formatDueDate = (dueDate: number) => {
    const daysRemaining = getDaysRemaining(dueDate);

    if (daysRemaining < 0) {
      return {
        text: `Overdue by ${Math.abs(daysRemaining)} ${Math.abs(daysRemaining) === 1 ? 'day' : 'days'}`,
        color: 'text-red-600',
        icon: AlertCircle,
      };
    } else if (daysRemaining === 0) {
      return {
        text: 'Due today',
        color: 'text-orange-600',
        icon: Clock,
      };
    } else if (daysRemaining === 1) {
      return {
        text: 'Due tomorrow',
        color: 'text-orange-600',
        icon: Clock,
      };
    } else if (daysRemaining <= 2) {
      return {
        text: `Due in ${daysRemaining} days`,
        color: 'text-orange-600',
        icon: Clock,
      };
    } else {
      return {
        text: `Due in ${daysRemaining} days`,
        color: 'text-gray-600',
        icon: Clock,
      };
    }
  };

  // 📌 处理任务点击
  const handleTaskClick = (task: Task) => {
    if (task.classCode) {
      router.push(
        `/dashboard/student/classroom/${task.classCode}/task/${task._id}`
      );
    }
  };

  // 📌 获取任务状态
  const getTaskStatus = (task: Task) => {
    if (task.submissionStatus === 'graded') return 'graded';
    if (task.isSubmitted) return 'submitted';
    return 'not-submitted';
  };

  // 📌 渲染状态徽章
  const renderStatusBadge = (task: Task) => {
    const status = getTaskStatus(task);

    switch (status) {
      case 'graded':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
            <Star className="h-3.5 w-3.5" />
            <span>Graded</span>
            {task.grade !== null && task.grade !== undefined && (
              <span className="ml-1 font-bold">{task.grade}%</span>
            )}
          </div>
        );
      case 'submitted':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Submitted</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
            <Clock className="h-3.5 w-3.5" />
            <span>Pending</span>
          </div>
        );
    }
  };

  const displayTasks = allTasks?.slice(0, 5);

  if (!user) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Current Tasks</h2>
        <p className="text-gray-500">Please sign in to view your tasks.</p>
      </div>
    );
  }

  if (!displayTasks || displayTasks.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Current Tasks</h2>
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No tasks available</p>
          <p className="text-sm text-gray-400 mt-1">
            Join a class to see assignments
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Current Tasks</h2>
        {allTasks && allTasks.length > 5 && (
          <button
            onClick={() => router.push('/dashboard/student/tasks')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {allTasks.length - 5} more tasks →
          </button>
        )}
      </div>

      <div className="space-y-3">
        {displayTasks.map((task) => {
          const dueDateInfo = task.dueDate ? formatDueDate(task.dueDate) : null;
          const DueDateIcon = dueDateInfo?.icon;

          return (
            <div
              key={task._id}
              onClick={() => handleTaskClick(task)}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] hover:bg-gray-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-medium text-gray-900 truncate">
                      {task.title}
                    </h3>
                    {renderStatusBadge(task)}
                  </div>

                  <div className="flex items-center gap-4 text-sm flex-wrap">
                    <span className="text-gray-600 truncate">
                      {task.className || 'Unknown Class'}
                    </span>

                    {dueDateInfo && DueDateIcon && (
                      <div className={`flex items-center gap-1 ${dueDateInfo.color}`}>
                        <DueDateIcon className="h-4 w-4" />
                        <span className="font-medium">{dueDateInfo.text}</span>
                      </div>
                    )}
                  </div>

                  {task.description && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}