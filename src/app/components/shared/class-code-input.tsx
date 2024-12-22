"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { classCodeSchema } from "@/lib/validations";

interface ClassCodeInputProps {
    userRole: 'teacher' | 'student';
}

export function ClassCodeInput({ userRole }: ClassCodeInputProps) {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const generateClassCode = () => {
        // 生成6位随机字母数字组合
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
            // 验证班级代码
            const validatedCode = classCodeSchema.parse(code);
            console.log('Valid class code:', validatedCode);
            // TODO: 之后会添加数据库操作
            setTimeout(() => {
                router.push(`/dashboard/${userRole}?classCode=${validatedCode}`);
            }, 1000);
        } catch (error) {
            setError('Invalid class code format');
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