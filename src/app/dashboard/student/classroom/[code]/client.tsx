'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { Button } from '@/app/components/ui/button';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { Id } from '../../../../../../convex/_generated/dataModel';

interface TaskDetailClientProps {
  classCode: string;
  taskId: string;
}

export default function TaskDetailClient({
  classCode,
  taskId,
}: TaskDetailClientProps) {
  const router = useRouter();
  console.log('TaskDetailClient - Props received:', { classCode, taskId });

  // 验证 taskId
  if (!taskId) {
    console.error('TaskDetailClient - No taskId provided');
    return <div>Error: Task ID is missing</div>;
  }

  // 将 useQuery 移到最外层
  const task = useQuery(api.tasks.getTask, {
    taskId: taskId as Id<'tasks'>,
  });

  console.log('TaskDetailClient - Query result:', task);

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
              onClick={() => {
                console.log('Submit task:', taskId);
                // TODO: 实现提交功能
              }}
            >
              Submit Task
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
