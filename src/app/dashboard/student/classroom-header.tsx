'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Button } from '@/app/components/ui/button';
import { useRouter } from 'next/navigation';

interface ClassroomHeaderProps {
  code: string;
}

export function ClassroomHeader({ code }: ClassroomHeaderProps) {
  const router = useRouter();
  const classroom = useQuery(api.classes.getClassInfo, { code });

  if (!classroom) {
    return (
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="py-4">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/student')}
              className="mb-4"
            >
              ← Back to Dashboard
            </Button>
          </div>
          <div className="h-16 flex items-center">
            <div className="animate-pulse bg-gray-200 h-8 w-48 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="py-4">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/student')}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
        </div>
        <div className="h-16 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {classroom.name || `class ${code}`}
            </h1>
            <p className="text-sm text-gray-500">class code：{code}</p>
          </div>
          <div className="text-sm text-gray-500">
            {classroom.students.length} students
          </div>
        </div>
      </div>
    </div>
  );
}
