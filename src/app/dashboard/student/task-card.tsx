'use client';

import { formatDate } from '@/lib/utils';
import { Button } from '@/app/components/ui/button';
import { useRouter } from 'next/navigation';
import { Clock } from 'lucide-react';

interface TaskCardProps {
  task: {
    _id: string;
    title: string;
    description: string;
    dueDate?: number;
    createdAt: number;
  };
  classCode: string;
}

export function TaskCard({ task, classCode }: TaskCardProps) {
  const router = useRouter();

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{task.title}</h3>
          <p className="text-gray-600 mt-2">{task.description}</p>
          {task.dueDate && (
            <div className="flex items-center text-sm text-gray-500 mt-2">
              <Clock className="w-4 h-4 mr-1" />
              Due: {formatDate(task.dueDate)}
            </div>
          )}
        </div>
        <Button
          onClick={() =>
            router.push(
              `/dashboard/student/classroom/${classCode}/task/${task._id}`
            )
          }
          variant="secondary"
        >
          View Details
        </Button>
      </div>
    </div>
  );
}
