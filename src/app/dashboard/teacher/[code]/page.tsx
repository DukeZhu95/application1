"use client";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { ClassroomHeader } from '../classroom-header';
import { TaskForm } from '../task-form';
import { TaskList } from '../task-list';

interface ClassroomPageProps {
    params: {
        code: string;
    };
}

export default function ClassroomPage({ params }: ClassroomPageProps) {
    // 使用班级代码获取班级信息
    const classroom = useQuery(api.classes.getClassInfo, { code: params.code });

    if (!classroom) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-white">
            <ClassroomHeader code={params.code} />

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 左侧：班级信息和任务表单 */}
                    <div className="space-y-6">
                        <TaskForm classroomId={classroom._id} />
                    </div>

                    {/* 右侧：任务列表 */}
                    <div>
                        <TaskList classroomId={classroom._id} />
                    </div>
                </div>
            </main>
        </div>
    );
}