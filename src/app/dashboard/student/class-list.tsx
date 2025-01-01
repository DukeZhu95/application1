'use client';

import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';

export function StudentClassList() {
  const { user } = useUser();
  const router = useRouter();

  const classes = useQuery(
    api.classes.getStudentClasses,
    user?.id ? { studentId: user.id } : 'skip'
  );

  if (!user?.id) {
    return (
      <Card>
        <CardContent className="text-center py-6">
          <p className="text-gray-500">Please sign in to view your classes.</p>
        </CardContent>
      </Card>
    );
  }

  if (!classes) {
    return (
      <div className="space-y-4">
        {[1, 2].map((n) => (
          <div key={n} className="animate-pulse">
            <div className="h-32 bg-gray-100 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (classes.length === 0) {
    console.log('StudentClassList - No classes found');
    return (
      <Card>
        <CardContent className="text-center py-6">
          <p className="text-gray-500">
            You haven&apos;t joined any classes yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {classes.map((classroom) => (
        <Card
          key={classroom._id}
          className="hover:bg-gray-50 cursor-pointer transition-colors"
          onClick={() =>
            router.push(`/dashboard/student/classroom/${classroom.code}`)
          }
        >
          <CardHeader>
            <CardTitle>{classroom.name || `Class ${classroom.code}`}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Code: {classroom.code}</p>
            {classroom.students?.map(
              (student) =>
                student.studentId === user?.id && (
                  <p key={student.studentId} className="text-sm text-gray-500">
                    Joined: {formatDate(student.joinedAt)}
                  </p>
                )
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
