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
        <div className="class-head">
          <h3 className="class-title">{className}</h3>
          <div className="class-info">
            <p className="class-code">Code: {code}</p>
            <p className="student-count">{studentCount} student(s)</p>
          </div>
        </div>

        <div className="class-buttons">
          <Button
            onClick={() => setShowTaskForm(true)}
            variant="outline"
            className="w-full"
          >
            Create New Task
          </Button>

          {showTaskForm && (
            <CreateTaskForm
              classId={id}
              onClose={() => setShowTaskForm(false)}
            />
          )}
        </div>
      </div>
    </Card>
  );
}
