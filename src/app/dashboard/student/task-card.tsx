'use client';

import { formatDate } from '@/lib/utils';
import { Button } from '@/app/components/ui/button';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle2, AlertCircle, Star } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { useUser } from '@clerk/nextjs';

interface TaskCardProps {
  task: {
    _id: string;
    title: string;
    description: string;
    dueDate?: number;
    createdAt: number;
  };
  classCode: string;
}

export function TaskCard({ task, classCode }: TaskCardProps) {
  const router = useRouter();
  const { user } = useUser();

  // 获取当前学生的提交状态
  const submission = useQuery(
    api.submissions.getStudentSubmission,
    user?.id
      ? {
        taskId: task._id as Id<'tasks'>,
        studentId: user.id,
      }
      : 'skip'
  );

  // 判断是否逾期
  const isOverdue = task.dueDate && task.dueDate < Date.now();
  const isSubmitted = !!submission;
  const isGraded = submission?.status === 'graded';

  // 状态徽章组件
  const StatusBadge = () => {
    if (isGraded) {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          <Star className="w-4 h-4" />
          <span>Graded: {submission.grade}/100</span>
        </div>
      );
    }

    if (isSubmitted) {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" />
          <span>Submitted</span>
        </div>
      );
    }

    if (isOverdue) {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
          <AlertCircle className="w-4 h-4" />
          <span>Overdue</span>
        </div>
      );
    }

    return (
      <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
        Not Submitted
      </div>
    );
  };

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="card-content">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="card-title">{task.title}</h3>
              <StatusBadge />
            </div>

            <p className="card-meta mt-2 line-clamp-2">{task.description}</p>

            <div className="flex items-center gap-4 mt-3">
              {task.dueDate && (
                <div
                  className={`card-meta flex items-center ${
                    isOverdue && !isSubmitted ? 'text-red-600' : ''
                  }`}
                >
                  <Clock className="w-4 h-4 mr-1" />
                  Due: {formatDate(task.dueDate)}
                </div>
              )}

              {isSubmitted && submission.submittedAt && (
                <div className="card-meta flex items-center text-blue-600">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Submitted: {formatDate(submission.submittedAt)}
                </div>
              )}
            </div>

            {/* 显示评分和反馈 */}
            {isGraded && submission.feedback && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Teacher&apos;s Feedback:
                </p>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {submission.feedback}
                </p>
              </div>
            )}
          </div>

          <div className="card-actions flex-shrink-0">
            <Button
              onClick={() =>
                router.push(
                  `/dashboard/student/classroom/${classCode}/task/${task._id}`
                )
              }
              variant="secondary"
            >
              View Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}