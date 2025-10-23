import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { toast } from '@/app/components/ui/use-toast';
import { Id } from '../../../../convex/_generated/dataModel';
import { FileText, Plus, Sparkles, Loader2, Clock } from 'lucide-react';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  dueDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface CreateTaskFormProps {
  classId: Id<'classrooms'>;
  onClose: () => void;
}

export function CreateTaskForm({ classId, onClose }: CreateTaskFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createTask = useMutation(api.tasks.createTask);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  const onSubmit = async (data: TaskFormData) => {
    try {
      setIsSubmitting(true);
      await createTask({
        ...data,
        classroomId: classId,
        dueDate: data.dueDate ? new Date(data.dueDate).getTime() : undefined,
      });

      toast({
        title: 'Success',
        description: 'Task created successfully',
      });
      onClose();
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
    <div
      style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '32px',
        background: 'rgba(255, 255, 255, 0.98)',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(139, 92, 246, 0.15)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(139, 92, 246, 0.3)',
          }}
        >
          <Plus size={28} color="white" strokeWidth={3} />
        </div>
        <div>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0',
            }}
          >
            Create New Task
          </h2>
          <p
            style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '4px 0 0 0',
            }}
          >
            Add assignments and activities for your students
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#8b5cf6',
              marginBottom: '8px',
            }}
          >
            <FileText size={16} />
            Task Title
            <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <Input
            {...register('title')}
            placeholder="e.g., Math Homework Chapter 5"
            disabled={isSubmitting}
          />
          {errors.title && (
            <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px' }}>
              {errors.title.message}
            </p>
          )}
        </div>

        <div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#8b5cf6',
              marginBottom: '8px',
            }}
          >
            <Sparkles size={16} />
            Task Description
            <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <Textarea
            {...register('description')}
            placeholder="Describe the task requirements, objectives, and any special instructions..."
            rows={4}
            disabled={isSubmitting}
          />
          {errors.description && (
            <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px' }}>
              {errors.description.message}
            </p>
          )}
        </div>

        <div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#8b5cf6',
              marginBottom: '8px',
            }}
          >
            <Clock size={16} />
            Due Date and Time
            <span
              style={{
                fontSize: '12px',
                fontWeight: '400',
                color: '#6b7280',
                marginLeft: '4px',
              }}
            >
              (Optional)
            </span>
          </label>

          <p
            style={{
              fontSize: '13px',
              color: '#6b7280',
              marginBottom: '8px',
              lineHeight: '1.4',
            }}
          >
            Select when students should complete this task. Leave empty if there is no deadline.
          </p>

          <Input
            {...register('dueDate')}
            type="datetime-local"
            disabled={isSubmitting}
          />

          <p
            style={{
              fontSize: '12px',
              color: '#8b5cf6',
              marginTop: '6px',
              fontStyle: 'italic',
            }}
          >
            Tip: Choose a future date and time for the task deadline
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <Button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              flex: '1',
              padding: '12px',
              borderRadius: '12px',
              border: '2px solid rgba(139, 92, 246, 0.2)',
              background: 'transparent',
              color: '#8b5cf6',
              fontWeight: '600',
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            style={{
              flex: '2',
              padding: '12px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus size={18} />
                Create Task
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}