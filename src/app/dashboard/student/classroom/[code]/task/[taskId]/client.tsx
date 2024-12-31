'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../../../../../../convex/_generated/api';
import { Button } from '@/app/components/ui/button';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { Id } from '../../../../../../../../convex/_generated/dataModel';
import { useState } from 'react';
import { TaskSubmissionForm } from '@/app/dashboard/student/task-submission-form';
import { FileIcon } from 'lucide-react';

interface TaskDetailClientProps {
  classCode: string;
  taskId: string;
}

export default function TaskDetailClient({
  classCode,
  taskId,
}: TaskDetailClientProps) {
  const router = useRouter();
  const [isSubmissionFormOpen, setIsSubmissionFormOpen] = useState(false);

  const task = useQuery(api.tasks.getTask, {
    taskId: taskId as Id<'tasks'>,
  });

  const submission = useQuery(api.tasks.getTaskSubmission, {
    taskId: taskId as Id<'tasks'>,
  });

  // 验证 taskId
  if (!taskId) {
    console.error('TaskDetailClient - No taskId provided');
    return <div>Error: Task ID is missing</div>;
  }

  // 加载状态
  if (!task) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // 错误处理
  if ('error' in task) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-red-500">Error loading task details.</div>
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/dashboard/student/classroom/${classCode}`)
            }
            className="mt-4"
          >
            Back to Class
          </Button>
        </div>
      </div>
    );
  }

  // 主要内容渲染
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/dashboard/student/classroom/${classCode}`)
            }
          >
            Back to Class
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">{task.title}</h1>
            {task.dueDate && (
              <p className="text-gray-500 mt-2">
                Due: {formatDate(task.dueDate)}
              </p>
            )}
          </div>

          <div className="prose max-w-none">
            <p>{task.description}</p>
          </div>

          <div className="pt-6">
            <Button
              className="w-full"
              onClick={() => setIsSubmissionFormOpen(true)}
            >
              Submit Task
            </Button>
          </div>
        </div>

        <TaskSubmissionForm
          taskId={taskId}
          isOpen={isSubmissionFormOpen}
          onClose={() => setIsSubmissionFormOpen(false)}
        />

        {submission && (
          <div className="mt-8 p-4 border rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Your Submission</h2>
            <div className="space-y-4">
              {/* 提交内容 */}
              <div>
                <p className="whitespace-pre-wrap">{submission.content}</p>
                {submission.attachmentUrl && (
                  <div className="mt-2">
                    <a
                      href={submission.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline flex items-center gap-2"
                    >
                      <FileIcon className="w-4 h-4" />
                      {submission.attachmentName || 'Download Attachment'}
                    </a>
                  </div>
                )}
              </div>

              {/* 评分和反馈部分 */}
              {submission.status === 'graded' && (
                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Grade</h3>
                    <span className="text-lg font-bold">
                      {submission.grade}
                    </span>
                  </div>
                  {submission.feedback && (
                    <div className="mt-2">
                      <h3 className="font-semibold mb-1">Teacher's Feedback</h3>
                      <p className="text-gray-700">{submission.feedback}</p>
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    Graded on: {formatDate(submission.gradedAt!)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
