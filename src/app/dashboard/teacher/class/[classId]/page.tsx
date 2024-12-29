'use client';
import { useQuery } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { Button } from '@/app/components/ui/button';
import { Id } from '../../../../../../convex/_generated/dataModel';
import { TaskForm } from '@/app/dashboard/teacher/task-form';
import { TaskList } from '@/app/dashboard/teacher/task-list';
import { Suspense, use } from 'react';

interface ClassDetailsPageProps {
  params: {
    classId: Id<'classrooms'>;
  };
}

function ClassDetails({ classId }: { classId: Id<'classrooms'> }) {
  const classroom = useQuery(api.classes.getClassById, {
    classId,
  });

  if (!classroom) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">{classroom.name}</h1>
            <p className="text-gray-500">Code: {classroom.code}</p>
            <p className="text-sm text-gray-500">
              {classroom.students.length} student(s)
            </p>
          </div>
          <Button variant="outline" onClick={() => window.history.back()}>
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <TaskForm classId={classroom._id} />
          </div>
          <div>
            <TaskList classId={classroom._id} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClassDetailsPage({ params }: ClassDetailsPageProps) {
  const resolvedParams = use(Promise.resolve(params)); // 添加这行

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClassDetails classId={params.classId} />
    </Suspense>
  );
}
