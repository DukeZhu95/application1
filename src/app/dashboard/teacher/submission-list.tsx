'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { formatDate } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { GradeSubmissionForm } from './grade-submission-form';
import { Id } from '../../../../convex/_generated/dataModel';
import { FileIcon, Download, Eye, CheckCircle2, User } from 'lucide-react';

interface SubmissionListProps {
  taskId: Id<'tasks'>;
}

interface Submission {
  _id: string;
  taskId: Id<'tasks'>;
  studentId: string;
  content: string;
  submittedAt: number;
  status?: string;
  grade?: number;
  feedback?: string;
  gradedAt?: number;
  storageId?: string;
  attachmentName?: string;
  attachmentUrl?: string;
}

export function SubmissionList({ taskId }: SubmissionListProps) {
  const submissions = useQuery(api.submissions.getTaskSubmissions, { taskId });

  if (!submissions) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Submissions</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-32 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Submissions</h2>
        <span className="text-sm text-gray-500">
          {submissions.length} submission(s)
        </span>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No submissions yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {submissions.map((submission) => (
            <SubmissionCard key={submission._id} submission={submission} taskId={taskId} />
          ))}
        </div>
      )}
    </div>
  );
}

// 新增：单个提交卡片组件，负责查询学生信息
function SubmissionCard({
                          submission,
                          taskId
                        }: {
  submission: Submission;
  taskId: Id<'tasks'>;
}) {
  // 查询学生个人资料获取真实姓名
  const studentProfile = useQuery(
    api.students.getStudentProfile,
    { studentId: submission.studentId }
  );

  // 获取学生显示名称
  const studentName = studentProfile
    ? `${studentProfile.firstName || ''} ${studentProfile.lastName || ''}`.trim()
    : 'Loading...';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Student Submission</span>
          <span className="text-sm font-normal text-gray-500">
            Submitted: {formatDate(submission.submittedAt)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 显示学生真实姓名 */}
          <div>
            <h4 className="font-medium text-sm text-gray-600 flex items-center gap-2">
              <User className="w-4 h-4" />
              Student:
            </h4>
            <p className="mt-1 text-gray-800 font-medium">
              {studentName || submission.studentId}
            </p>
          </div>

          {/* Submission Content */}
          <div>
            <h4 className="font-medium">Response:</h4>
            <p className="mt-1 text-gray-600 whitespace-pre-wrap">
              {submission.content}
            </p>
          </div>

          {/* 附件 */}
          {submission.storageId && submission.attachmentName && (
            <div className="mt-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <FileIcon className="w-4 h-4" />
                Attachment:
              </h4>
              <FileDownloadCard
                storageId={submission.storageId}
                fileName={submission.attachmentName}
                fileUrl={submission.attachmentUrl}
              />
            </div>
          )}

          {/* Grade Display or Grading Form */}
          {submission.status === 'graded' && submission.grade !== undefined ? (
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <h4 className="font-medium">Grade: {submission.grade}/100</h4>
              </div>
              {submission.feedback && (
                <p className="mt-2 text-gray-600">
                  Feedback: {submission.feedback}
                </p>
              )}
              {submission.gradedAt && (
                <p className="text-sm text-gray-500 mt-2">
                  Graded on: {formatDate(submission.gradedAt)}
                </p>
              )}
            </div>
          ) : (
            <GradeSubmissionForm
              taskId={taskId}
              studentId={submission.studentId}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// 处理单个文件的组件
function FileDownloadCard({
                            storageId,
                            fileName,
                            fileUrl: providedUrl,
                          }: {
  storageId: string;
  fileName: string;
  fileUrl?: string;
}) {
  const fetchedUrl = useQuery(
    api.files.getFileUrl,
    providedUrl ? 'skip' : { storageId }
  );
  const fileUrl = providedUrl || fetchedUrl;

  return (
    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center gap-3">
        <FileIcon className="w-5 h-5 text-blue-600" />
        <div>
          <p className="text-sm font-medium text-gray-900">{fileName}</p>
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