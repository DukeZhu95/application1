'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from '@/app/components/ui/form';
import { FileUpload } from './file-upload';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/app/components/ui/use-toast';

const formSchema = z.object({
  content: z.string().min(1, 'Please write your submission'),
});

type FormValues = z.infer<typeof formSchema>;

interface TaskSubmissionFormProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskSubmissionForm({
                                     taskId,
                                     isOpen,
                                     onClose,
                                   }: TaskSubmissionFormProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const submit = useMutation(api.submissions.submitTask);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const generateUploadUrl = useMutation(api.tasks.generateUploadUrl);

  // 获取当前任务的提交情况
  const existingSubmission = useQuery(
    api.submissions.getStudentSubmission,
    user?.id
      ? {
        taskId: taskId as Id<'tasks'>,
        studentId: user.id,
      }
      : 'skip'
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: existingSubmission?.content || '',
    },
  });

  // 当现有提交内容加载后更新表单
  useState(() => {
    if (existingSubmission?.content) {
      form.setValue('content', existingSubmission.content);
    }
  });

  const onSubmit = async (values: FormValues) => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to submit',
        variant: 'destructive',
      });
      return;
    }

    // ✅ 检查是否已评分（前端验证）
    if (existingSubmission?.status === 'graded') {
      toast({
        title: 'Cannot Submit',
        description: 'This task has been graded and cannot be modified',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      let storageId: Id<'_storage'> | undefined;
      let fileName: string | undefined;

      // 上传文件
      if (file) {
        const uploadUrl = await generateUploadUrl();

        const result = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Content-Type': file.type,
          },
          body: file,
        });

        if (!result.ok) {
          throw new Error('Failed to upload file');
        }

        const { storageId: newStorageId } = await result.json();
        storageId = newStorageId as Id<'_storage'>;
        fileName = file.name;
      }

      // 提交任务
      await submit({
        taskId: taskId as Id<'tasks'>,
        studentId: user.id,
        content: values.content,
        storageId,
        fileName,
      });

      toast({
        title: 'Success',
        description: existingSubmission
          ? 'Your submission has been updated'
          : 'Your task has been submitted',
      });

      onClose();
      form.reset();
      setFile(null);
    } catch (error) {
      console.error('Failed to submit task:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to submit task. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {existingSubmission ? 'Update Submission' : 'Submit Task'}
          </DialogTitle>
        </DialogHeader>

        {/* ✅ 如果已评分，显示警告 */}
        {existingSubmission?.status === 'graded' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-700 font-medium">
              ⚠️ This task has been graded and cannot be modified.
            </p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Write your submission here..."
                      className="min-h-[250px]"
                      disabled={
                        isSubmitting ||
                        existingSubmission?.status === 'graded'
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Attachment (optional)
              </label>
              {existingSubmission?.attachmentName && !file && (
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  Current file: {existingSubmission.attachmentName}
                </div>
              )}
              <FileUpload
                onFileSelect={(selectedFile) => setFile(selectedFile)}
                disabled={
                  isSubmitting || existingSubmission?.status === 'graded'
                }
              />
              {file && (
                <p className="text-sm text-gray-600">
                  New file selected: {file.name}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting || existingSubmission?.status === 'graded'
                }
              >
                {isSubmitting
                  ? 'Submitting...'
                  : existingSubmission
                    ? 'Update Submission'
                    : 'Submit Task'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}