// app/components/dashboard/teacher/task-form.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { toast } from '@/app/components/ui/use-toast';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  dueDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  classId: Id<'classrooms'>;
}

export function TaskForm({ classId }: TaskFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createTask = useMutation(api.tasks.createTask);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  const onSubmit = async (data: TaskFormData) => {
    try {
      setIsSubmitting(true);
      await createTask({
        title: data.title,
        description: data.description,
        classroomId: classId,
        dueDate: data.dueDate ? new Date(data.dueDate).getTime() : undefined,
      });

      toast({
        title: 'Success',
        description: 'Task created successfully',
      });
      reset();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to create task',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Create New Task</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input {...register('title')} placeholder="Task title" />
          {errors.title && (
            <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <Textarea
            {...register('description')}
            placeholder="Task description"
            className="min-h-[100px]"
          />
          {errors.description && (
            <p className="text-sm text-red-500 mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <div>
          <Input {...register('dueDate')} type="datetime-local" />
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Creating...' : 'Create Task'}
        </Button>
      </form>
    </div>
  );
}
