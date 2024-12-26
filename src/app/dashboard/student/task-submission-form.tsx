import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/app/components/ui/card';
import { toast } from '@/app/components/ui/use-toast';
import { Id } from '../../../../convex/_generated/dataModel';
import { FileUpload } from './file-upload';

const submissionSchema = z.object({
  content: z.string().min(1, 'Submission content is required'),
});

type SubmissionFormData = z.infer<typeof submissionSchema>;

interface TaskSubmissionFormProps {
  taskId: Id<'tasks'>;
  isSubmitted: boolean;
}

export function TaskSubmissionForm({
  taskId,
  isSubmitted,
}: TaskSubmissionFormProps) {
  const submit = useMutation(api.tasks.submitTask);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const onSubmit = async (data: SubmissionFormData) => {
    try {
      setIsSubmitting(true);
      // 如果有文件，先处理文件上传
      let attachmentUrl = '';
      let attachmentName = '';

      if (selectedFile) {
        // 这里需要实现文件上传逻辑
        // 可以上传到 S3、Cloudinary 等服务
        // 暂时留空，等待实现
      }
      await submit({
        taskId,
        content: data.content,
        attachmentUrl,
        attachmentName: selectedFile?.name || '',
      });
      toast({
        title: 'Success',
        description: 'Task submitted successfully',
      });
      reset();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to submit task',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Task</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Textarea
              {...register('content')}
              placeholder="Enter your submission..."
              className="min-h-[200px]"
              disabled={isSubmitting}
            />
            {errors.content && (
              <p className="text-sm text-red-500 mt-1">
                {errors.content.message}
              </p>
            )}
          </div>

          <FileUpload onFileSelect={handleFileSelect} disabled={isSubmitting} />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Task'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
