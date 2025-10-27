"use client";

import { use, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../../../../convex/_generated/api';
import { Id } from '../../../../../../../../convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  User,
  Award,
  MessageSquare,
  Download,
  Eye
} from 'lucide-react';

interface PageProps {
  params: Promise<{
    classId: string;
    taskId: string;
  }>;
}

export default function TeacherTaskSubmissionsPage({ params }: PageProps) {
  const { classId, taskId } = use(params);
  const router = useRouter();
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null);
  const [gradeValue, setGradeValue] = useState('');
  const [feedbackValue, setFeedbackValue] = useState('');

  // 获取任务信息
  const task = useQuery(api.tasks.getTaskById, {
    taskId: taskId as Id<'tasks'>
  });

  // ✅ 获取所有提交 - 使用 taskSubmissions 表
  const submissions = useQuery(api.submissions.getTaskSubmissions, {
    taskId: taskId as Id<'tasks'>
  });

  const gradeSubmission = useMutation(api.submissions.gradeSubmission);

  // 格式化日期
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 提交批改
  const handleGradeSubmit = async (submission: any) => {
    const grade = parseInt(gradeValue);
    if (isNaN(grade) || grade < 0 || grade > 100) {
      alert('Please enter a valid grade (0-100)');
      return;
    }

    try {
      await gradeSubmission({
        taskId: submission.taskId,
        studentId: submission.studentId,
        grade,
        feedback: feedbackValue.trim() || undefined,
      });
      setGradingSubmissionId(null);
      setGradeValue('');
      setFeedbackValue('');
      alert('Grade submitted successfully!');
    } catch (error) {
      console.error('Error grading submission:', error);
      alert('Failed to submit grade');
    }
  };

  if (!task || !submissions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push(`/dashboard/teacher/class/${classId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Class</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Task Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {task.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Due: {formatDate(task.dueDate || Date.now())}
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {submissions.length} submission(s)
                </div>
              </div>
            </div>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700">{task.description}</p>
          </div>
        </div>

        {/* Submissions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-purple-600" />
            Submissions
            <span className="text-lg font-normal text-gray-500">
              ({submissions.length})
            </span>
          </h2>

          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No submissions yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div
                  key={submission._id}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                >
                  {/* Student Info */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Student: {submission.studentId.substring(0, 20)}...
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Submitted: {formatDate(submission.submittedAt)}
                        </p>
                      </div>
                    </div>

                    {submission.grade !== undefined && (
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-2xl font-bold text-green-600">
                          <Award className="w-6 h-6" />
                          {submission.grade}/100
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ✅ Submission Content - 使用 content 字段 */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Submission:
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-800 whitespace-pre-wrap">
                        {submission.content}
                      </p>
                    </div>
                  </div>

                  {/* ✅ 附件 - 使用单个文件字段 */}
                  {submission.storageId && submission.attachmentName && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Attachment:
                      </h4>
                      <StudentFileDisplay
                        storageId={submission.storageId}
                        fileName={submission.attachmentName}
                      />
                    </div>
                  )}

                  {/* Feedback */}
                  {submission.feedback && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        Your Feedback:
                      </h4>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-gray-800">{submission.feedback}</p>
                      </div>
                    </div>
                  )}

                  {/* Grading Section */}
                  {gradingSubmissionId === submission._id ? (
                    <div className="border-t border-gray-200 pt-4 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Grade (0-100)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={gradeValue}
                          onChange={(e) => setGradeValue(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter grade"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Feedback (Optional)
                        </label>
                        <textarea
                          value={feedbackValue}
                          onChange={(e) => setFeedbackValue(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                          placeholder="Add feedback for the student..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleGradeSubmit(submission)}
                          className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Submit Grade
                        </button>
                        <button
                          onClick={() => {
                            setGradingSubmissionId(null);
                            setGradeValue('');
                            setFeedbackValue('');
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-t border-gray-200 pt-4">
                      <button
                        onClick={() => {
                          setGradingSubmissionId(submission._id);
                          setGradeValue(submission.grade?.toString() || '');
                          setFeedbackValue(submission.feedback || '');
                        }}
                        className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        {submission.grade !== undefined ? 'Update Grade' : 'Grade Submission'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ✅ 修复：显示学生提交文件的组件
function StudentFileDisplay({ storageId, fileName }: { storageId: string; fileName: string }) {
  const fileUrl = useQuery(api.files.getFileUrl, { storageId });

  return (
    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center gap-3">
        <FileText className="w-5 h-5 text-blue-600" />
        <div>
          <p className="text-sm font-medium text-gray-900">
            {fileName}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
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
          <span className="text-xs text-gray-500 px-3 py-1">Loading...</span>
        )}
      </div>
    </div>
  );
}