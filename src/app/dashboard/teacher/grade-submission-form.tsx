import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { toast } from "@/app/components/ui/use-toast";

const gradeSchema = z.object({
    grade: z.number()
        .min(0, "Grade cannot be negative")
        .max(100, "Grade cannot exceed 100"),
    feedback: z.string().optional(),
});

type GradeFormData = z.infer<typeof gradeSchema>;

interface GradeSubmissionFormProps {
    taskId: Id<"tasks">;
    studentId: string;
}

export function GradeSubmissionForm({ taskId, studentId }: GradeSubmissionFormProps) {
    const gradeSubmission = useMutation(api.tasks.gradeSubmission);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<GradeFormData>({
        resolver: zodResolver(gradeSchema),
    });

    const onSubmit = async (data: GradeFormData) => {
        try {
            setIsSubmitting(true);
            await gradeSubmission({
                taskId,
                studentId,
                grade: data.grade,
                feedback: data.feedback,
            });

            toast({
                title: "Success",
                description: "Submission graded successfully",
            });

            reset();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to grade submission",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade (0-100)
                </label>
                <Input
                    type="number"
                    {...register("grade", { valueAsNumber: true })}
                    className="w-full"
                    placeholder="Enter grade"
                    disabled={isSubmitting}
                />
                {errors.grade && (
                    <p className="text-sm text-red-500 mt-1">
                        {errors.grade.message}
                    </p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Feedback (optional)
                </label>
                <Textarea
                    {...register("feedback")}
                    className="w-full min-h-[100px]"
                    placeholder="Enter feedback for the student"
                    disabled={isSubmitting}
                />
                {errors.feedback && (
                    <p className="text-sm text-red-500 mt-1">
                        {errors.feedback.message}
                    </p>
                )}
            </div>

            <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
            >
                {isSubmitting ? "Submitting grade..." : "Submit grade"}
            </Button>
        </form>
    );
}