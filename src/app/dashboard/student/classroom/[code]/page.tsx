// app/dashboard/student/classroom/[code]/page.tsx
"use client";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { ClassroomHeader } from '@/app/dashboard/student/classroom-header';
import { StudentTaskList } from '@/app/dashboard/student/task-list';

interface StudentClassroomPageProps {
    params: {
        code: string;
    };
}

export default function StudentClassroomPage({ params }: StudentClassroomPageProps) {
    const classroom = useQuery(api.classes.getClassInfo, { code: params.code });

    if (!classroom) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-white">
            <ClassroomHeader code={params.code} />

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="space-y-6">
                    <StudentTaskList classroomId={classroom._id} />
                </div>
            </main>
        </div>
    );
}