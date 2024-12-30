'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { StudentTaskList } from '@/app/dashboard/student/task-list';
import { ClassroomHeader } from '@/app/dashboard/student/classroom-header';

interface PageProps {
  params: {
    code: string;
  };
}

export default function ClassroomPage({ params }: PageProps) {
  console.log('ClassroomPage - params:', params); // 调试日志

  const classroom = useQuery(api.classes.getClassInfo, { code: params.code });

  if (!classroom) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <ClassroomHeader code={params.code} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <StudentTaskList
            classroomId={classroom._id}
            classCode={params.code} // 确保传递 classCode
          />
        </div>
      </main>
    </div>
  );
}
