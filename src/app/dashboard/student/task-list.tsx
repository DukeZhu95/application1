// app/components/dashboard/student/task-list.tsx
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { Card, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface StudentTaskListProps {
  classroomId: Id<'classrooms'>;
}

export function StudentTaskList({ classroomId }: StudentTaskListProps) {
  const tasks = useQuery(api.tasks.getClassTasks, { classroomId });

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
          {tasks.map((task) => (
            <Card
              key={task._id}
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <CardHeader className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <CardTitle>{task.title}</CardTitle>
                    <p className="text-gray-600">{task.description}</p>
                    {task.dueDate && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>Due: {formatDate(task.dueDate)}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-4 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full md:w-auto"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
