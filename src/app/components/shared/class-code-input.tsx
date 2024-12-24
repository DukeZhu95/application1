"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { classCodeSchema } from "@/lib/validations";

interface ClassCodeInputProps {
    userRole: 'teacher' | 'student';
    onClassCreated?: (code: string) => void;
    isDisabled?: boolean;
}

export function ClassCodeInput({ userRole }: ClassCodeInputProps) {
    const { user } = useUser();
    const router = useRouter();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const createClass = useMutation(api.classes.createClass);
    const joinClass = useMutation(api.classes.joinClass);

    const generateClassCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCode(result);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const validatedCode = classCodeSchema.parse(code);

            if (userRole === 'teacher') {
                await createClass({
                    code: validatedCode,
                    teacherId: user?.id || '',
                    name: `Class ${validatedCode}`
                });
            } else {
                await joinClass({
                    code: validatedCode,
                    studentId: user?.id || ''
                });
            }

            router.push(`/dashboard/${userRole}?classCode=${validatedCode}`);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">
                {userRole === 'teacher' ? 'Create Class Code' : 'Join Class'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="Enter 6-digit code"
                            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            maxLength={6}
                        />
                        {userRole === 'teacher' && (
                            <button
                                type="button"
                                onClick={generateClassCode}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                            >
                                Generate
                            </button>
                        )}
                    </div>
                    {error && (
                        <p className="text-sm text-red-500 mt-1">{error}</p>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={loading || code.length !== 6}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading
                        ? 'Processing...'
                        : userRole === 'teacher'
                            ? 'Create Class'
                            : 'Join Class'
                    }
                </button>
            </form>
        </div>
    );
}