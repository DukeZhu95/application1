import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "../../components/ui/card";
import { toast } from "../../components/ui/use-toast";
import { Id } from "../../../../convex/_generated/dataModel";

const taskSchema = z.object({
    title: z.string().min(1, "The title is required"),
    description: z.string().min(1, "The description is required"),
    dueDate: z.string().optional(), // 保持为字符串类型，在提交时转换
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
    classroomId: Id<"classrooms">;
}

export function TaskForm({ classroomId }: TaskFormProps) {
    const createTask = useMutation(api.tasks.createTask);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<TaskFormData>({
        resolver: zodResolver(taskSchema),
    });

    const onSubmit = async (data: TaskFormData) => {
        try {
            setIsSubmitting(true);
            await createTask({
                title: data.title,
                description: data.description,
                classroomId,
                // 转换日期字符串为时间戳
                dueDate: data.dueDate ? new Date(data.dueDate).getTime() : undefined,
            });
            toast({
                title: "Task created",
                description: "Students can now see the new task",
            });
            reset();
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : "Unknown error";

            toast({
                title: "Could not create task",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Creat New Task</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <div>
                        <Input
                            {...register("title")}
                            placeholder="task title"
                            className="w-full"
                        />
                        {errors.title && (
                            <span className="text-sm text-red-500">
                                {errors.title.message}
                            </span>
                        )}
                    </div>

                    <div>
                        <Textarea
                            {...register("description")}
                            placeholder="task description"
                            className="w-full min-h-[100px]"
                        />
                        {errors.description && (
                            <span className="text-sm text-red-500">
                                {errors.description.message}
                            </span>
                        )}
                    </div>

                    <div>
                        <Input
                            {...register("dueDate")}
                            type="datetime-local"
                            className="w-full"
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full"
                    >
                        {isSubmitting ? "creating..." : "task creates"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}