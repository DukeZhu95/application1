'use client';

import { useState } from 'react';
import { SubmissionList } from './submission-list';
import { Id } from '../../../../convex/_generated/dataModel';
import { formatDate } from '@/lib/utils';

interface TaskProps {
  task: {
    _id: Id<'tasks'>;
    title: string;
    description: string;
    dueDate?: number;
  };
}

export function TaskDetails({ task }: TaskProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{task.title}</h2>
        <p className="text-gray-600 mt-2">{task.description}</p>
        {task.dueDate && (
          <p className="text-sm text-gray-500 mt-2">
            Due: {formatDate(task.dueDate)}
          </p>
        )}
      </div>

      <div className="border-t pt-6">
        <SubmissionList taskId={task._id} />
      </div>
    </div>
  );
}
