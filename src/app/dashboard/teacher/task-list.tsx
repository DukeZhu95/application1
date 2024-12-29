// app/dashboard/teacher/task-list.tsx
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { formatDate } from '@/lib/utils';
import { Id } from '../../../../convex/_generated/dataModel';

interface TaskListProps {
  classId: Id<'classrooms'>; // 修改为 Convex Id 类型
}

export function TaskList({ classId }: TaskListProps) {
  const tasks = useQuery(api.tasks.getClassTasks, {
    classroomId: classId,
  });

  if (!tasks) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Tasks</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-32 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Tasks</h2>
      {tasks.length === 0 ? (
        <Card>
          <CardContent className="text-center py-6 text-gray-500">
            No tasks yet
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <Card key={task._id}>
              <CardHeader>
                <CardTitle>{task.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{task.description}</p>
                {task.dueDate && (
                  <p className="text-sm text-gray-500 mt-2">
                    Due date：{formatDate(task.dueDate)}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
