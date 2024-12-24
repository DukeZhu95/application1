"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ClassCodeInput } from "@/app/components/shared/class-code-input";

export default function TeacherDashboard() {
    const { user } = useUser();
    const [className, setClassName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [feedback, setFeedback] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);

    const createClass = useMutation(api.classes.createClass);

    const handleClassCreated = async (code: string) => {
        if (!user || !className.trim()) {
            setFeedback({
                type: 'error',
                message: 'Please enter a class name'
            });
            return;
        }

        setIsCreating(true);
        try {
            await createClass({
                code,
                teacherId: user.id,
                name: className.trim()
            });

            setFeedback({
                type: 'success',
                message: `Class "${className}" created successfully with code: ${code}`
            });
            setClassName('');
        } catch (error) {
            setFeedback({
                type: 'error',
                message: 'Failed to create class. Please try again.'
            });
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <nav className="border-b">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between h-16 items-center">
                        <h1 className="text-2xl font-bold text-black">
                            Teacher Dashboard
                        </h1>
                        <UserButton />
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Create New Class
                        </h2>
                        {feedback && (
                            <div className={`p-4 rounded-md mb-4 ${
                                feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}>
                                {feedback.message}
                            </div>
                        )}
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="className" className="block text-sm font-medium text-gray-700">
                                    Class Name
                                </label>
                                <input
                                    type="text"
                                    id="className"
                                    value={className}
                                    onChange={(e) => setClassName(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Enter class name"
                                    disabled={isCreating}
                                />
                            </div>
                            <ClassCodeInput
                                userRole="teacher"
                                onClassCreated={handleClassCreated}
                                isDisabled={isCreating}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}