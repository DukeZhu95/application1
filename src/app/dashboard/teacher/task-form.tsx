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
import { Upload, X, Loader2, Image as ImageIcon, FileText, File } from 'lucide-react';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  dueDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface UploadedFile {
  file: File;
  storageId: Id<"_storage">;
  previewUrl?: string;
}

interface TaskFormProps {
  classId: Id<'classrooms'>;
}

export function TaskForm({ classId }: TaskFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const createTask = useMutation(api.tasks.createTask);
  const generateUploadUrl = useMutation(api.tasks.generateUploadUrl);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  const canUploadMore = uploadedFiles.length < 5;

  // 处理文件选择
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const remainingSlots = 5 - uploadedFiles.length;
    const filesToUpload = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      toast({
        title: 'Warning',
        description: `Maximum 5 files allowed. Only uploading first ${remainingSlots} file(s).`,
      });
    }

    for (const file of filesToUpload) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: `${file.name} is too large. Maximum size is 10MB.`,
          variant: 'destructive',
        });
        continue;
      }
      await uploadFile(file);
    }
    event.target.value = '';
  };

  // 上传单个文件
  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true);

      // 如果是图片，生成预览
      let previewUrl: string | undefined;
      if (file.type.startsWith('image/')) {
        previewUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }

      // 上传到 Convex storage
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      const { storageId } = await result.json();

      setUploadedFiles((prev) => [...prev, { file, storageId: storageId as Id<"_storage">, previewUrl }]);

      toast({
        title: 'Success',
        description: `${file.name} uploaded successfully`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: `Failed to upload ${file.name}`,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // 移除文件
  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // 获取文件图标
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return <ImageIcon size={18} />;
    }
    if (['pdf'].includes(ext || '')) {
      return <FileText size={18} />;
    }
    return <File size={18} />;
  };

  const onSubmit = async (data: TaskFormData) => {
    try {
      setIsSubmitting(true);
      await createTask({
        title: data.title,
        description: data.description,
        classroomId: classId,
        dueDate: data.dueDate ? new Date(data.dueDate).getTime() : undefined,
        // 添加文件信息
        storageIds: uploadedFiles.map((f) => f.storageId),
        attachmentNames: uploadedFiles.map((f) => f.file.name),
      });

      toast({
        title: 'Success',
        description: 'Task created successfully',
      });
      reset();
      setUploadedFiles([]); // 清空已上传文件
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

        {/* 文件上传部分 */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <Upload size={16} />
            Attachments (Optional) - {uploadedFiles.length}/5 files
          </label>

          {/* 已上传的文件列表 */}
          {uploadedFiles.map((uploadedFile, index) => (
            <div
              key={index}
              className="border rounded-lg p-3 space-y-2"
            >
              {/* 图片预览 */}
              {uploadedFile.previewUrl && (
                <img
                  src={uploadedFile.previewUrl}
                  alt="Preview"
                  className="w-full max-h-48 object-contain rounded bg-gray-50"
                />
              )}

              {/* 文件信息 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded text-purple-600">
                    {getFileIcon(uploadedFile.file.name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(uploadedFile.file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-2 hover:bg-red-50 rounded text-red-500"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ))}

          {/* 上传按钮 */}
          {canUploadMore && (
            <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              {isUploading ? (
                <Loader2 size={24} className="animate-spin text-purple-600" />
              ) : (
                <Upload size={24} className="text-purple-600" />
              )}
              <div className="text-center">
                <p className="text-sm font-medium">
                  {isUploading ? 'Uploading...' : 'Click to upload files'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {isUploading
                    ? 'Please wait...'
                    : `Up to ${5 - uploadedFiles.length} more file(s) • Max 10MB each`}
                </p>
              </div>
              <input
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
                disabled={isUploading}
                multiple
              />
            </label>
          )}

          {/* 文件数量达到上限提示 */}
          {!canUploadMore && (
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-600">
                Maximum 5 files reached
              </p>
            </div>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting || isUploading} className="w-full">
          {isSubmitting ? 'Creating...' : 'Create Task'}
        </Button>
      </form>
    </div>
  );
}