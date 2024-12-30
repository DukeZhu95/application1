import { Suspense } from 'react';
import TaskDetailClient from './client';

interface PageProps {
  params: {
    code: string;
    taskId: string;
  };
}

export default function TaskDetailPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white p-6">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      }
    >
      <TaskDetailClient classCode={params.code} taskId={params.taskId} />
    </Suspense>
  );
}
