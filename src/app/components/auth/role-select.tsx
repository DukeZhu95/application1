"use client"

import { useSignUp } from "@clerk/nextjs";
import { Button } from "../ui/button";
import { useState } from "react";
import { UserRole } from "@/lib/types";

export function RoleSelect() {
    const { signUp, setActive } = useSignUp();
    const [isLoading, setIsLoading] = useState(false);

    const selectRole = async (role: UserRole) => {
        if (!signUp) return;

        try {
            setIsLoading(true);
            // 将角色保存到 Clerk 的 publicMetadata
            await signUp.update({
                // publicMetadata: { role }
            });

            // 继续注册流程
            await setActive({ session: signUp.createdSessionId });
        } catch (error) {
            console.error('Error selecting role:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold">Select your role:</h2>
                <p className="text-sm text-gray-600">Please select your account type for signing up</p>
            </div>

            <div className="flex flex-col gap-4">
                <Button
                    onClick={() => selectRole('teacher')}
                    disabled={isLoading}
                    className="w-full"
                    variant="outline"
                >
                    I am a teacher
                </Button>

                <Button
                    onClick={() => selectRole('student')}
                    disabled={isLoading}
                    className="w-full"
                    variant="outline"
                >
                    I am a student
                </Button>
            </div>
        </div>
    );
}