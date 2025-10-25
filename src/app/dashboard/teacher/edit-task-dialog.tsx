import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { toast } from '@/app/components/ui/use-toast';
import { Upload, X, FileText, Image as ImageIcon, File } from 'lucide-react';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  dueDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface UploadedFile {
  file: File;
  storageId: Id<'_storage'>;
  previewUrl?: string;
}

interface EditTaskDialogProps {
  task: {
    _id: Id<'tasks'>;
    title: string;
    description: string;
    dueDate?: number;
    attachmentUrls?: string[];
    attachmentNames?: string[];
    attachmentUrl?: string;
    attachmentName?: string;
  };
  onClose: () => void;
}

export function EditTaskDialog({ task, onClose }: EditTaskDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [existingFiles, setExistingFiles] = useState<string[]>([]);

  const updateTask = useMutation(api.tasks.updateTask);
  const generateUploadUrl = useMutation(api.tasks.generateUploadUrl);

  useEffect(() => {
    const files: string[] = [];
    if (task.attachmentNames && task.attachmentNames.length > 0) {
      files.push(...task.attachmentNames);
    } else if (task.attachmentName) {
      files.push(task.attachmentName);
    }
    setExistingFiles(files);
  }, [task]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task.title,
      description: task.description,
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().slice(0, 16)
        : undefined,
    },
  });

  const totalFiles = uploadedFiles.length + existingFiles.length;
  const canUploadMore = totalFiles < 5;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const remainingSlots = 5 - totalFiles;
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

  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true);
      let previewUrl: string | undefined;
      if (file.type.startsWith('image/')) {
        previewUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      const { storageId } = await result.json();
      setUploadedFiles((prev) => [...prev, { file, storageId: storageId as Id<'_storage'>, previewUrl }]);
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

  const removeUploadedFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingFile = (index: number) => {
    setExistingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return <ImageIcon size={20} />;
    }
    if (['pdf'].includes(ext || '')) {
      return <FileText size={20} />;
    }
    return <File size={20} />;
  };

  const onSubmit = async (data: TaskFormData) => {
    try {
      setIsSubmitting(true);
      await updateTask({
        taskId: task._id,
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate).getTime() : undefined,
        storageIds: uploadedFiles.map((f) => f.storageId),
        fileNames: uploadedFiles.map((f) => f.file.name),
        keepExistingFiles: existingFiles,
      });
      toast({
        title: 'Success',
        description: 'Task updated successfully',
      });
      onClose();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 px-6 pt-6">
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-6 py-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Task Title</label>
              <Input
                {...register('title')}
                placeholder="Enter task title"
                style={{ color: '#fff' }}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Description</label>
              <Textarea
                {...register('description')}
                placeholder="Enter task description"
                rows={4}
                style={{ color: '#fff' }}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Due Date</label>
              <Input
                {...register('dueDate')}
                type="datetime-local"
                style={{ color: '#fff' }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Attachments (Optional) - {totalFiles}/5 files
              </label>

              {existingFiles.map((fileName, index) => (
                <div key={`existing-${index}`} className="border rounded-xl p-3 mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      {getFileIcon(fileName)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: '#fff' }}>{fileName}</p>
                      <p className="text-xs text-gray-500">Existing attachment</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => removeExistingFile(index)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:bg-red-50"
                  >
                    <X size={18} />
                  </Button>
                </div>
              ))}

              {uploadedFiles.map((uploadedFile, index) => (
                <div key={`uploaded-${index}`} className="border rounded-xl p-3 mb-2">
                  {uploadedFile.previewUrl && (
                    <img
                      src={uploadedFile.previewUrl}
                      alt="Preview"
                      className="w-full max-h-48 object-contain rounded-lg mb-3 bg-gray-100"
                    />
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                        {getFileIcon(uploadedFile.file.name)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: '#fff' }}>{uploadedFile.file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(uploadedFile.file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => removeUploadedFile(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-50"
                    >
                      <X size={18} />
                    </Button>
                  </div>
                </div>
              ))}

              {canUploadMore && (
                <label className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed rounded-xl cursor-pointer hover:border-purple-400 transition-all">
                  <Upload size={24} className="text-gray-400" />
                  <div className="text-center">
                    <p className="font-semibold">
                      {isUploading ? 'Uploading...' : 'Click to upload files'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {isUploading
                        ? 'Please wait...'
                        : `Up to ${5 - totalFiles} more file(s) • Max 10MB each`}
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

              {!canUploadMore && (
                <div className="p-4 bg-gray-100 rounded-xl text-center">
                  <p className="text-sm text-gray-600">Maximum 5 files reached</p>
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="flex justify-end gap-2 pt-4 px-6 pb-4 border-t flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting || isUploading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting || isUploading}
            onClick={handleSubmit(onSubmit)}
          >
            {isSubmitting ? 'Updating...' : 'Update Task'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}