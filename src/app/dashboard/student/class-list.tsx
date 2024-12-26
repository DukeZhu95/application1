// app/components/dashboard/student/class-list.tsx
import { useQuery } from 'convex/react';
import { useUser } from '@clerk/nextjs';
import { api } from '../../../../convex/_generated/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Id } from '../../../../convex/_generated/dataModel';

interface Classroom {
  _id: Id<'classrooms'>;
  code: string;
  name?: string;
  teacherId: string;
  createdAt: number;
  students: string[];
}

export function StudentClassList() {
  const { user } = useUser();
  const classes = useQuery(api.classes.getStudentClasses, {
    studentId: user?.id || '',
  });

  if (!classes || classes.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">You haven't joined any classes yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {classes.map((classroom: Classroom) => (
        <Card key={classroom._id}>
          <CardHeader>
            <CardTitle>{classroom.name || `Class ${classroom.code}`}</CardTitle>
            <CardDescription>Code: {classroom.code}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Students: {classroom.students.length}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
