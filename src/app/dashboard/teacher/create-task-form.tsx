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
import { FileText, Plus, Sparkles, Loader2, Clock, Upload, X, Image as ImageIcon, File } from 'lucide-react';

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

interface CreateTaskFormProps {
  classId: Id<'classrooms'>;
  onClose: () => void;
}

export function CreateTaskForm({ classId, onClose }: CreateTaskFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const createTask = useMutation(api.tasks.createTask);
  const generateUploadUrl = useMutation(api.tasks.generateUploadUrl);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  const canUploadMore = uploadedFiles.length < 5;

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

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
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
      await createTask({
        ...data,
        classroomId: classId,
        dueDate: data.dueDate ? new Date(data.dueDate).getTime() : undefined,
        storageIds: uploadedFiles.map((f) => f.storageId),
        attachmentNames: uploadedFiles.map((f) => f.file.name),
      });

      toast({
        title: 'Success',
        description: 'Task created successfully',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create task',
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
        maxHeight: '90vh',
        overflow: 'auto',
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
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', margin: '0' }}>
            Create New Task
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
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
            <span style={{ fontSize: '12px', fontWeight: '400', color: '#6b7280', marginLeft: '4px' }}>
              (Optional)
            </span>
          </label>
          <Input
            {...register('dueDate')}
            type="datetime-local"
            disabled={isSubmitting}
          />
        </div>

        {/* File Upload Section */}
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
            <Upload size={16} />
            Attachments (Optional) - {uploadedFiles.length}/5 files
          </label>

          {/* Uploaded Files */}
          {uploadedFiles.map((uploadedFile, index) => (
            <div
              key={index}
              style={{
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '8px',
              }}
            >
              {uploadedFile.previewUrl && (
                <img
                  src={uploadedFile.previewUrl}
                  alt="Preview"
                  style={{
                    width: '100%',
                    maxHeight: '200px',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    background: '#f3f4f6',
                    marginBottom: '12px',
                  }}
                />
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      padding: '8px',
                      background: 'rgba(139, 92, 246, 0.1)',
                      borderRadius: '8px',
                      color: '#8b5cf6',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {getFileIcon(uploadedFile.file.name)}
                  </div>
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '14px', margin: 0 }}>
                      {uploadedFile.file.name}
                    </p>
                    <p style={{ color: '#6b7280', fontSize: '12px', margin: '2px 0 0 0' }}>
                      {(uploadedFile.file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={18} color="#ef4444" />
                </button>
              </div>
            </div>
          ))}

          {/* Upload Button */}
          {canUploadMore && (
            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '24px',
                border: '2px dashed rgba(139, 92, 246, 0.3)',
                borderRadius: '12px',
                cursor: isUploading ? 'not-allowed' : 'pointer',
                background: 'rgba(139, 92, 246, 0.02)',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                if (!isUploading) {
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.02)';
              }}
            >
              {isUploading ? (
                <Loader2 size={24} color="#8b5cf6" className="animate-spin" />
              ) : (
                <Upload size={24} color="#8b5cf6" />
              )}
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: '600', margin: 0 }}>
                  {isUploading ? 'Uploading...' : 'Click to upload files'}
                </p>
                <p style={{ color: '#6b7280', fontSize: '13px', margin: '4px 0 0 0' }}>
                  {isUploading
                    ? 'Please wait...'
                    : `Up to ${5 - uploadedFiles.length} more file(s) • Max 10MB each`}
                </p>
              </div>
              <input
                type="file"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                accept="image/*,.pdf,.doc,.docx,.txt"
                disabled={isUploading}
                multiple
              />
            </label>
          )}

          {!canUploadMore && (
            <div
              style={{
                padding: '16px',
                background: '#f3f4f6',
                borderRadius: '12px',
                textAlign: 'center',
              }}
            >
              <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                Maximum 5 files reached
              </p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <Button
            type="button"
            onClick={onClose}
            disabled={isSubmitting || isUploading}
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
            disabled={isSubmitting || isUploading}
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