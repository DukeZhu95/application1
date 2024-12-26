// app/components/dashboard/student/task-card.tsx
import { formatDate } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { useRouter } from 'next/navigation';
import { Clock, FileText } from 'lucide-react';

interface TaskCardProps {
  task: {
    _id: string;
    title: string;
    description: string;
    dueDate?: number;
    createdAt: number;
  };
  classroomId: string;
}

export function TaskCard({ task, classroomId }: TaskCardProps) {
  const router = useRouter();

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{task.title}</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              router.push(
                `/dashboard/student/classroom/${classroomId}/task/${task._id}`
              )
            }
          >
            <FileText className="w-4 h-4 mr-2" />
            View details
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-600">{task.description}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {task.dueDate ? (
                <span>Due date：{formatDate(task.dueDate)}</span>
              ) : (
                <span>No due date</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
