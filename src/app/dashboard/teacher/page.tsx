"use client";

import { UserButton } from "@clerk/nextjs";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ClassCodeInput } from "@/app/components/shared/class-code-input";

export default function TeacherDashboard() {
    const [className, setClassName] = useState("");
    const createClass = useMutation(api.classes.createClass);

    const handleClassCreated = (code: string) => {
        createClass({
            code,
            teacherId: "current-user-id",  // 稍后会从 Clerk 获取
            name: className
        });
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
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Enter class name"
                                />
                            </div>
                            <ClassCodeInput
                                userRole="teacher"
                                onClassCreated={handleClassCreated}
                            />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Your Classes
                        </h2>
                        {/* 这里稍后会添加班级列表 */}
                        <p className="text-gray-500">No classes created yet.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}