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

interface SubmissionListProps {
  taskId: Id<'tasks'>;
}

export function SubmissionList({ taskId }: SubmissionListProps) {
  const submissions = useQuery(api.tasks.getTaskSubmissions, { taskId });

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
          {submissions.length} submissions
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
                  <div>
                    <h4 className="font-medium">Content:</h4>
                    <p className="mt-1 text-gray-600">{submission.content}</p>
                  </div>

                  {submission.status === 'graded' ? (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="font-medium">Grade: {submission.grade}</h4>
                      {submission.feedback && (
                        <p className="mt-2 text-gray-600">
                          Feedback: {submission.feedback}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-2">
                        Graded on: {formatDate(submission.gradedAt!)}
                      </p>
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
