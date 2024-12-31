import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { formatDate } from '@/lib/utils';
import { Id } from '../../../../convex/_generated/dataModel';
import { toast } from '@/app/components/ui/use-toast';
import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import { EditTaskDialog } from './edit-task-dialog';

interface Task {
  _id: Id<'tasks'>;
  title: string;
  description: string;
  dueDate?: number;
  classroomId: Id<'classrooms'>;
}

interface TaskListProps {
  classId: Id<'classrooms'>;
}

export function TaskList({ classId }: TaskListProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const deleteTask = useMutation(api.tasks.deleteTask);
  const tasks = useQuery(api.tasks.getClassTasks, { classroomId: classId });

  const handleDelete = async (taskId: Id<'tasks'>) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask({ taskId });
        toast({
          title: 'Success',
          description: 'Task deleted successfully',
        });
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to delete task',
          variant: 'destructive',
        });
      }
    }
  };

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
            <Card key={task._id} className="group">
              <CardHeader className="relative">
                <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingTask(task)}
                    className="mr-2"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(task._id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                <CardTitle>{task.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{task.description}</p>
                {task.dueDate && (
                  <p className="text-sm text-gray-500 mt-2">
                    Due date: {formatDate(task.dueDate)}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {editingTask && (
        <EditTaskDialog
          task={editingTask}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}
