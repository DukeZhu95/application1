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
  Eye,
  Star
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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
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
  const generateUploadUrl = useMutation(api.tasks.generateUploadUrl);

  // 格式化日期
  const formatDate = (timestamp: number | undefined): string => {
    if (!timestamp) return 'No due date';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 处理文件选择（单个文件）
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      toast.success('File selected');
    }
  };

  // 移除文件
  const removeFile = () => {
    setUploadedFile(null);
  };

  // 提交任务
  const handleSubmit = async () => {
    if (!user?.id) return;

    if (!submissionText.trim() && !uploadedFile) {
      toast.error('Please add some content or a file to submit');
      return;
    }

    // 检查是否已评分
    if (submission?.status === 'graded') {
      toast.error('Cannot modify a graded submission');
      return;
    }

    setIsSubmitting(true);

    try {
      let storageId: Id<'_storage'> | undefined;
      let fileName: string | undefined;

      // 上传文件
      if (uploadedFile) {
        toast.loading('Uploading file...');
        const uploadUrl = await generateUploadUrl();

        const result = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': uploadedFile.type },
          body: uploadedFile,
        });

        if (!result.ok) {
          throw new Error(`Upload failed: ${result.statusText}`);
        }

        const { storageId: newStorageId } = await result.json();
        storageId = newStorageId as Id<'_storage'>;
        fileName = uploadedFile.name;

        toast.dismiss();
        toast.success('File uploaded');
      }

      // 提交任务
      await submitTask({
        taskId,
        studentId: user.id,
        content: submissionText,
        storageId,
        fileName,
      });

      toast.success('Task submitted successfully!');
      setSubmissionText('');
      setUploadedFile(null);
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit task');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 状态检查
  const isSubmitted = !!submission;
  const isGraded = submission?.status === 'graded';
  const isOverdue = !!(task?.dueDate && Date.now() > task.dueDate);
  const canSubmit = !isGraded && (!isOverdue || isSubmitted);

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
            {/* 状态徽章 */}
            {isGraded && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                <Star className="w-5 h-5 fill-current" />
                <span className="font-semibold">Graded: {submission.grade}/100</span>
              </div>
            )}
            {isSubmitted && !isGraded && (
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">Submitted</span>
              </div>
            )}
          </div>

          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
            <p className="text-gray-700">{task.description}</p>
          </div>

          {/* 教师附件 - 修复类型问题 */}
          {task.attachmentUrls && task.attachmentUrls.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Paperclip className="w-5 h-5" />
                Teacher&apos;s Attachments ({task.attachmentUrls.filter((url: string | null) => url !== null).length})
              </h3>
              <div className="space-y-2">
                {task.attachmentUrls
                  .map((url: string | null, idx: number) => ({ url, idx }))
                  .filter(({ url }) => url !== null)
                  .map(({ url, idx }) => (
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
                          href={url!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1 text-sm text-purple-600 hover:bg-purple-100 rounded-md transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </a>
                        <a
                          href={url!}
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

        {/* 提交表单或已提交内容 */}
        {!isSubmitted ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Submission</h2>

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

            {/* 单个文件上传 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachment (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
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
                    Click to upload a file
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PDF, DOC, images, or any file type
                  </span>
                </label>
              </div>

              {uploadedFile && (
                <div className="mt-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {uploadedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(uploadedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      onClick={removeFile}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !canSubmit}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                !canSubmit
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
              } ${isSubmitting ? 'opacity-50 cursor-wait' : ''}`}
            >
              {isSubmitting ? 'Submitting...' : !canSubmit ? 'Submission Closed' : 'Submit Task'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 已评分 - 评分卡片 */}
            {isGraded && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-green-600 fill-current" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900">Grade Received</h2>
                    <p className="text-sm text-gray-600">
                      Graded on {formatDate(submission.gradedAt)}
                    </p>
                  </div>
                  <div className="text-3xl font-bold text-green-600">
                    {submission.grade}/100
                  </div>
                </div>

                {submission.feedback && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Teacher&apos;s Feedback:</h3>
                    <p className="text-gray-800 whitespace-pre-wrap">{submission.feedback}</p>
                  </div>
                )}
              </div>
            )}

            {/* 提交内容 */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isGraded ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  <CheckCircle2 className={`w-6 h-6 ${
                    isGraded ? 'text-green-600' : 'text-blue-600'
                  }`} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Your Submission</h2>
                  <p className="text-sm text-gray-600">
                    Submitted on {formatDate(submission.submittedAt)}
                  </p>
                </div>
              </div>

              {/* 使用 content 字段 */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Your Answer:</h3>
                <p className="text-gray-800 whitespace-pre-wrap">
                  {submission.content}
                </p>
              </div>

              {/* 单个文件显示 */}
              {submission.storageId && submission.attachmentName && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    Your Uploaded File:
                  </h3>
                  <FileDisplay
                    storageId={submission.storageId}
                    fileName={submission.attachmentName}
                  />
                </div>
              )}

              {/* 锁定提示 */}
              {isGraded && (
                <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    This submission has been graded and can no longer be modified.
                  </p>
                </div>
              )}

              {/* 未评分时允许更新 */}
              {!isGraded && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-gray-700 mb-3">
                    You can update your submission until it&apos;s graded.
                  </p>
                  <button
                    onClick={() => {
                      setSubmissionText(submission.content);
                      window.location.reload();
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Update Submission
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 文件显示组件
function FileDisplay({ storageId, fileName }: { storageId: string; fileName: string }) {
  const fileUrl = useQuery(api.files.getFileUrl, { storageId });

  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
      <div className="flex items-center gap-3">
        <FileText className="w-5 h-5 text-blue-600" />
        <div>
          <p className="text-sm font-medium text-gray-900">{fileName}</p>
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
              download={fileName}
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