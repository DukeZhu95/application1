import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { useState } from 'react';
import { CreateTaskForm } from './create-task-form';
import { Id } from '../../../../convex/_generated/dataModel';

interface ClassCardProps {
  className: string;
  code: string;
  studentCount: number;
  id: Id<'classrooms'>;
}

export function ClassCard({
  className,
  code,
  studentCount,
  id,
}: ClassCardProps) {
  const [showTaskForm, setShowTaskForm] = useState(false);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">{className}</h3>
          <p className="text-sm text-gray-500">Code: {code}</p>
          <p className="text-sm text-gray-500">{studentCount} student(s)</p>
        </div>

        <Button
          onClick={() => setShowTaskForm(true)}
          variant="outline"
          className="w-full"
        >
          Create New Task
        </Button>

        {showTaskForm && (
          <CreateTaskForm classId={id} onClose={() => setShowTaskForm(false)} />
        )}
      </div>
    </Card>
  );
}
