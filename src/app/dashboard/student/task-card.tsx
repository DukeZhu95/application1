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
    <div className="card">
      <div className="card-content">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="card-title">{task.title}</h3>
            <p className="card-meta mt-2">{task.description}</p>
            {task.dueDate && (
              <div className="card-meta flex items-center mt-2">
                <Clock className="w-4 h-4 mr-1" />
                Due: {formatDate(task.dueDate)}
              </div>
            )}
          </div>
          <div className="card-actions">
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
      </div>
    </div>
  );
}
