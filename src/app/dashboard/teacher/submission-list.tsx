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
import { FileIcon, Download, Eye, CheckCircle2 } from 'lucide-react';

interface SubmissionListProps {
  taskId: Id<'tasks'>;
}

export function SubmissionList({ taskId }: SubmissionListProps) {
  // 使用正确的 API
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
            <Card key={submission._id}>
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
                  {/* Student ID */}
                  <div>
                    <h4 className="font-medium text-sm text-gray-600">Student ID:</h4>
                    <p className="mt-1 text-gray-800 text-sm font-mono">
                      {submission.studentId}
                    </p>
                  </div>

                  {/* Submission Content - 使用 submissionText */}
                  <div>
                    <h4 className="font-medium">Response:</h4>
                    <p className="mt-1 text-gray-600 whitespace-pre-wrap">
                      {submission.submissionText}
                    </p>
                  </div>

                  {/* Attachments - 使用 submissionFiles 数组 */}
                  {submission.submissionFiles && submission.submissionFiles.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <FileIcon className="w-4 h-4" />
                        Attachments ({submission.submissionFiles.length}):
                      </h4>
                      <div className="space-y-2">
                        {submission.submissionFiles.map((file: { name: string; storageId: string; size: number }, idx: number) => (
                          <FileDownloadCard key={idx} file={file} />
                        ))}
                      </div>
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
          ))}
        </div>
      )}
    </div>
  );
}

// Component to handle file display with download links
function FileDownloadCard({ file }: { file: { name: string; storageId: string; size: number } }) {
  // Get the actual file URL from Convex Storage
  const fileUrl = useQuery(api.files.getFileUrl, { storageId: file.storageId });

  return (
    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center gap-3">
        <FileIcon className="w-5 h-5 text-blue-600" />
        <div>
          <p className="text-sm font-medium text-gray-900">{file.name}</p>
          <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
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
              download={file.name}
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