// app/components/dashboard/student/task-list.tsx
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { formatDate } from "@/lib/utils";

interface StudentTaskListProps {
    classroomId: Id<"classrooms">;
}

export function StudentTaskList({ classroomId }: StudentTaskListProps) {
    const tasks = useQuery(api.tasks.getClassTasks, { classroomId });

    if (!tasks) {
        return (
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Tasks</h2>
                <div className="animate-pulse space-y-4">
                    {[1, 2].map((n) => (
                        <div key={n} className="h-32 bg-gray-100 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Tasks</h2>
            {tasks.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-6 text-gray-500">
                        No tasks yet
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {tasks.map((task) => (
                        <Card key={task._id} className="overflow-hidden">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between p-6">
                                <div className="space-y-2">
                                    <CardTitle>{task.title}</CardTitle>
                                    <p className="text-gray-600">{task.description}</p>
                                    {task.dueDate && (
                                        <p className="text-sm text-gray-500">
                                            Due date：{formatDate(task.dueDate)}
                                        </p>
                                    )}
                                </div>
                                <div className="mt-4 md:mt-0 md:ml-4">
                                    <Button variant="outline" size="sm">
                                        View details
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}