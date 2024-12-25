// app/dashboard/student/classroom/[code]/task/[taskId]/page.tsx
"use client";
import { useQuery } from "convex/react";
import { api } from "../../../../../../../../convex/_generated/api";
import { ClassroomHeader } from '@/app/dashboard/student/classroom-header';
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Clock } from "lucide-react";
import {Id} from "../../../../../../../../convex/_generated/dataModel";
import { TaskSubmissionForm } from '@/app/dashboard/student/task-submission-form';

interface TaskPageProps {
    params: {
        code: string;
        taskId: Id<"tasks">; // 使用正确的 Id 类型
    };
}

export default function TaskPage({ params }: TaskPageProps) {
    const classroom = useQuery(api.classes.getClassInfo, { code: params.code });
    const taskStatus = useQuery(api.tasks.getStudentTaskStatus, {
        taskId: params.taskId
    });
    const task = classroom?._id ? useQuery(api.tasks.getClassTasks, {
        classroomId: classroom._id
    }) : undefined;

    if (!classroom || !taskStatus || !task) {
        return <div>Loading...</div>;
    }

    // 在当前班级的所有任务中找到当前任务
    const currentTask = task.find(t => t._id === params.taskId);
    if (!currentTask) {
        return <div>Task not found</div>;
    }

    return (
        <div className="min-h-screen bg-white">
            <ClassroomHeader code={params.code} />
            <main className="max-w-7xl mx-auto px-4 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>{currentTask.title}</CardTitle>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center text-sm text-gray-500">
                                <Clock className="w-4 h-4 mr-1" />
                                {currentTask.dueDate ? (
                                    <span>Due: {formatDate(currentTask.dueDate)}</span>
                                ) : (
                                    <span>No due date</span>
                                )}
                            </div>
                            <div className="text-sm text-gray-500">
                                Status: {taskStatus.isSubmitted ? 'Submitted' : 'Not submitted'}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <p className="text-gray-600">{currentTask.description}</p>
                            {taskStatus.submittedAt && (
                                <p className="text-sm text-gray-500">
                                    Submitted at: {formatDate(taskStatus.submittedAt)}
                                </p>
                            )}
                            <TaskSubmissionForm
                                taskId={params.taskId}
                                isSubmitted={taskStatus.isSubmitted}
                            />
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}