'use client';

import TaskDetailClient from '../../client';

interface PageProps {
  params: {
    code: string;
    taskId: string;
  };
}

export default function TaskDetailPage({ params }: PageProps) {
  // 添加更多调试信息
  console.log('TaskDetailPage received params:', params);
  console.log('TaskDetailPage taskId:', params?.taskId);
  console.log('TaskDetailPage code:', params?.code);

  // 确保所有必要的参数都存在
  if (!params?.taskId || !params?.code) {
    return <div>Error: Missing required parameters</div>;
  }

  return <TaskDetailClient classCode={params.code} taskId={params.taskId} />;
}
