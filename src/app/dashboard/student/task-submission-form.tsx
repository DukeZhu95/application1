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
  const submit = useMutation(api.tasks.submitTask);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const generateUploadUrl = useMutation(api.tasks.generateUploadUrl);

  // 获取当前任务的提交情况
  const existingSubmission = useQuery(api.tasks.getTaskSubmission, {
    taskId: taskId as Id<'tasks'>,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: existingSubmission?.content || '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      let storageId: string | undefined;
      let fileName: string | undefined;

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
        storageId = newStorageId;
        fileName = file.name;
      }

      await submit({
        taskId: taskId as Id<'tasks'>,
        content: values.content,
        storageId,
        fileName,
      });

      onClose();
      form.reset();
      setFile(null);
    } catch (error) {
      console.error('Failed to submit task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Submit Task</DialogTitle>
        </DialogHeader>
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
                      className="min-h-[200px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Attachment</label>
              <FileUpload
                onFileSelect={(selectedFile) => setFile(selectedFile)}
                disabled={isSubmitting}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
