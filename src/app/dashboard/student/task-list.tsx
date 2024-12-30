'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { formatDate } from '@/lib/utils';
import { Button } from '@/app/components/ui/button';
import { useRouter } from 'next/navigation';

interface StudentTaskListProps {
  classroomId: Id<'classrooms'>;
  classCode: string;
}

export function StudentTaskList({
  classroomId,
  classCode,
}: StudentTaskListProps) {
  const router = useRouter();
  const tasks = useQuery(api.tasks.getClassTasks, { classroomId });

  console.log('StudentTaskList - Props:', { classroomId, classCode });
  console.log('StudentTaskList - Tasks:', tasks);

  if (!tasks) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Class Tasks</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-32 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Class Tasks</h2>
        <span className="text-sm text-gray-500">
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} total
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No tasks available</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => {
            const taskPath = `/dashboard/student/classroom/${classCode}/task/${task._id}`;
            console.log('Task card path:', taskPath); // 调试日志

            return (
              <div key={task._id} className="border rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{task.title}</h3>
                    <p className="text-gray-600 mt-2">{task.description}</p>
                    {task.dueDate && (
                      <p className="text-sm text-gray-500 mt-2">
                        Due: {formatDate(task.dueDate)}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => {
                      console.log('Navigating to:', taskPath, {
                        classCode,
                        taskId: task._id,
                      });
                      router.push(taskPath);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
