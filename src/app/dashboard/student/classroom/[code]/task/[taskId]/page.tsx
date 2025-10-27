'use client';

import { use, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../../../../convex/_generated/api';
import { Id } from '../../../../../../../../convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  FileText,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  X,
  Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PageProps {
  params: Promise<{
    classCode: string;
    taskId: Id<'tasks'>;
  }>;
}

export default function StudentTaskDetailPage({ params }: PageProps) {
  const { taskId } = use(params);

  const { user } = useUser();
  const router = useRouter();
  const [submissionText, setSubmissionText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 获取任务详情
  const task = useQuery(api.tasks.getTaskById, { taskId });

  // 获取学生提交情况
  const submission = useQuery(
    api.submissions.getStudentSubmission,
    user?.id ? { taskId, studentId: user.id } : 'skip'
  );

  // Mutations
  const submitTask = useMutation(api.submissions.submitTask);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  // 格式化日期
  const formatDate = (timestamp: number | undefined): string => {
    if (!timestamp) return 'No due date';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles((prev) => [...prev, ...files]);
    toast.success(`${files.length} file(s) selected`);
  };

  // 移除文件
  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // 提交任务 - 使用 Convex Storage
  const handleSubmit = async () => {
    if (!user?.id) return;

    if (!submissionText.trim() && uploadedFiles.length === 0) {
      toast.error('Please add some content or files to submit');
      return;
    }

    setIsSubmitting(true);

    try {
      // 上传所有文件到 Convex Storage
      const submissionFiles = [];

      for (const file of uploadedFiles) {
        try {
          toast.loading(`Uploading ${file.name}...`);

          // 1. 获取上传 URL
          const uploadUrl = await generateUploadUrl();

          // 2. 上传文件到 Convex Storage
          const result = await fetch(uploadUrl, {
            method: 'POST',
            headers: { 'Content-Type': file.type },
            body: file,
          });

          if (!result.ok) {
            throw new Error(`Upload failed: ${result.statusText}`);
          }

          const { storageId } = await result.json();

          // 3. 保存文件信息（使用 storageId）
          submissionFiles.push({
            name: file.name,
            storageId: storageId,
            size: file.size,
          });

          toast.dismiss();
          toast.success(`${file.name} uploaded`);
        } catch (error) {
          console.error('File upload error:', error);
          toast.dismiss();
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      // 4. 提交任务
      await submitTask({
        taskId,
        studentId: user.id,
        submissionText,
        submissionFiles,
      });

      toast.success('Task submitted successfully!');
      setSubmissionText('');
      setUploadedFiles([]);
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit task');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 检查是否已提交
  const isSubmitted = !!(submission && submission.status === 'submitted');
  const isOverdue = !!(task?.dueDate && Date.now() > task.dueDate);
  const overdueStatus = isOverdue && !isSubmitted;

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading task details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Classroom</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Task Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{task.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Due: {formatDate(task.dueDate)}
                </div>
                {isOverdue && !isSubmitted && (
                  <div className="flex items-center gap-1 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    Overdue
                  </div>
                )}
              </div>
            </div>
            {isSubmitted && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">Submitted</span>
              </div>
            )}
          </div>

          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
            <p className="text-gray-700">{task.description}</p>
          </div>

          {/* ✅ 显示教师上传的附件 - 使用 attachmentUrls */}
          {task.attachmentUrls && task.attachmentUrls.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Paperclip className="w-5 h-5" />
                Teacher&apos;s Attachments ({task.attachmentUrls.length})
              </h3>
              <div className="space-y-2">
                {task.attachmentUrls.filter((url): url is string => url !== null && url !== undefined).map((url, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {task.attachmentNames?.[idx] || `Attachment ${idx + 1}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1 text-sm text-purple-600 hover:bg-purple-100 rounded-md transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </a>
                      <a
                        href={url}
                        download={task.attachmentNames?.[idx]}
                        className="flex items-center gap-1 px-3 py-1 text-sm text-purple-600 hover:bg-purple-100 rounded-md transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submission Form or Submitted Content */}
        {!isSubmitted ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Submission</h2>

            {/* Text Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Answer <span className="text-red-500">*</span>
              </label>
              <textarea
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Type your answer here..."
                rows={8}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
              />
            </div>

            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachments (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex flex-col items-center"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Click to upload files
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PDF, DOC, images, or any file type
                  </span>
                </label>
              </div>

              {/* Selected Files List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadedFiles.map((file: File, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <FileText className="w-5 h-5 text-gray-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || overdueStatus}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                overdueStatus
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
              } ${isSubmitting ? 'opacity-50 cursor-wait' : ''}`}
            >
              {isSubmitting ? 'Submitting...' : overdueStatus ? 'Submission Closed' : 'Submit Task'}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Task Submitted</h2>
                <p className="text-sm text-gray-600">
                  Submitted on {formatDate(submission.submittedAt)}
                </p>
              </div>
            </div>

            {/* Display Submission Content */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Your Submission:</h3>
              <p className="text-gray-800 whitespace-pre-wrap">
                {submission.submissionText}
              </p>
            </div>

            {/* Display Submitted Files */}
            {submission.submissionFiles && submission.submissionFiles.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Paperclip className="w-4 h-4" />
                  Your Uploaded Files ({submission.submissionFiles.length}):
                </h3>
                <div className="space-y-2">
                  {submission.submissionFiles.map((file: { name: string; storageId: string; size: number }, idx: number) => (
                    <FileDisplay key={idx} file={file} />
                  ))}
                </div>
              </div>
            )}

            {/* Grade Display */}
            {submission.grade !== undefined && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Grade:</h3>
                <p className="text-2xl font-bold text-green-600">{submission.grade}/100</p>
                {submission.feedback && (
                  <div className="mt-3">
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Feedback:</h4>
                    <p className="text-gray-700">{submission.feedback}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Component to display file with download link (学生上传的文件)
function FileDisplay({ file }: { file: { name: string; storageId: string; size: number } }) {
  const fileUrl = useQuery(api.files.getFileUrl, { storageId: file.storageId });

  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
      <div className="flex items-center gap-3">
        <FileText className="w-5 h-5 text-blue-600" />
        <div>
          <p className="text-sm font-medium text-gray-900">{file.name}</p>
          <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {fileUrl ? (
          <>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
            >
              <Eye className="w-4 h-4" />
              View
            </a>
            <a
              href={fileUrl}
              download={file.name}
              className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
          </>
        ) : (
          <span className="text-xs text-gray-500">Loading...</span>
        )}
      </div>
    </div>
  );
}