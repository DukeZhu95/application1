'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../../../../../../convex/_generated/api';
import { Button } from '@/app/components/ui/button';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { Id } from '../../../../../../../../convex/_generated/dataModel';
import { useState } from 'react';
import { TaskSubmissionForm } from '@/app/dashboard/student/task-submission-form';
import { FileIcon, CheckCircle2, Clock, Star, AlertCircle } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

interface TaskDetailClientProps {
  classCode: string;
  taskId: string;
}

export default function TaskDetailClient({
                                           classCode,
                                           taskId,
                                         }: TaskDetailClientProps) {
  const router = useRouter();
  const { user } = useUser();
  const [isSubmissionFormOpen, setIsSubmissionFormOpen] = useState(false);

  const task = useQuery(api.tasks.getTask, {
    taskId: taskId as Id<'tasks'>,
  });

  const submission = useQuery(
    api.submissions.getStudentSubmission,
    user?.id
      ? {
        taskId: taskId as Id<'tasks'>,
        studentId: user.id,
      }
      : 'skip'
  );

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

  // ✅ 状态判断
  const isSubmitted = !!submission;
  const isGraded = submission?.status === 'graded';
  const isOverdue = task.dueDate && task.dueDate < Date.now();
  const canSubmit = !isGraded && (!isOverdue || !isSubmitted);

  // 主要内容渲染
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* 顶部导航 */}
        <div className="mb-6 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/dashboard/student/classroom/${classCode}`)
            }
          >
            ← Back to Class
          </Button>

          {/* 状态指示器 */}
          {isGraded && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full font-medium">
              <Star className="w-5 h-5" />
              <span>Graded: {submission.grade}/100</span>
            </div>
          )}
          {isSubmitted && !isGraded && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium">
              <CheckCircle2 className="w-5 h-5" />
              <span>Submitted - Awaiting Grade</span>
            </div>
          )}
          {!isSubmitted && isOverdue && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full font-medium">
              <AlertCircle className="w-5 h-5" />
              <span>Overdue</span>
            </div>
          )}
        </div>

        {/* 任务详情 */}
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h1 className="text-3xl font-bold mb-2">{task.title}</h1>
            {task.dueDate && (
              <div
                className={`flex items-center gap-2 text-gray-600 ${
                  isOverdue && !isSubmitted ? 'text-red-600 font-medium' : ''
                }`}
              >
                <Clock className="w-5 h-5" />
                <span>Due: {formatDate(task.dueDate)}</span>
                {isOverdue && !isSubmitted && (
                  <span className="text-sm">(Overdue)</span>
                )}
              </div>
            )}
          </div>

          <div className="prose max-w-none">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {task.description}
            </p>
          </div>

          {/* ✅ 条件显示提交按钮 */}
          {!isSubmitted && (
            <div className="pt-4 border-t">
              {canSubmit ? (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => setIsSubmissionFormOpen(true)}
                >
                  Submit Task
                </Button>
              ) : (
                <div className="text-center py-4">
                  <p className="text-red-600 font-medium">
                    This task is overdue and can no longer be submitted.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ✅ 已提交但未评分 - 显示提交内容，可重新提交 */}
          {isSubmitted && !isGraded && (
            <div className="space-y-4">
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Your Submission</h2>
                  <div className="text-sm text-gray-500">
                    Submitted on {formatDate(submission.submittedAt)}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <p className="whitespace-pre-wrap text-gray-800">
                    {submission.content}
                  </p>

                  {submission.attachmentUrl && (
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <a
                        href={submission.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        <FileIcon className="w-4 h-4" />
                        {submission.attachmentName || 'Download Attachment'}
                      </a>
                    </div>
                  )}
                </div>

                {/* 允许重新提交（仅限未评分时） */}
                <div className="mt-4 flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    You can update your submission until it's graded.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setIsSubmissionFormOpen(true)}
                  >
                    Update Submission
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ✅ 已评分 - 显示提交内容和评分，锁定 */}
          {isGraded && submission && (
            <div className="space-y-6 border-t pt-6">
              {/* 评分卡片 */}
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-green-800 flex items-center gap-2">
                    <Star className="w-6 h-6 fill-current" />
                    Grade Received
                  </h2>
                  <div className="text-3xl font-bold text-green-700">
                    {submission.grade}/100
                  </div>
                </div>

                {submission.feedback && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Teacher&apos;s Feedback
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {submission.feedback}
                    </p>
                  </div>
                )}

                <p className="text-sm text-gray-600 mt-4">
                  Graded on: {formatDate(submission.gradedAt!)}
                </p>
              </div>

              {/* 提交内容 */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Your Submission</h2>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <p className="whitespace-pre-wrap text-gray-800">
                    {submission.content}
                  </p>

                  {submission.attachmentUrl && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <a
                        href={submission.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        <FileIcon className="w-4 h-4" />
                        {submission.attachmentName || 'Download Attachment'}
                      </a>
                    </div>
                  )}

                  <p className="text-sm text-gray-500 mt-4">
                    Submitted on: {formatDate(submission.submittedAt)}
                  </p>
                </div>

                {/* 锁定提示 */}
                <div className="mt-4 bg-gray-100 border border-gray-300 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    This submission has been graded and can no longer be
                    modified.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 提交表单对话框 */}
        <TaskSubmissionForm
          taskId={taskId}
          isOpen={isSubmissionFormOpen}
          onClose={() => setIsSubmissionFormOpen(false)}
        />
      </div>
    </div>
  );
}