"use client";
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    const { isLoaded, userId } = useAuth();

    // 等待认证状态加载完成
    if (!isLoaded) {
        return <div>Loading...</div>;
    }

    // 未登录则重定向
    if (!userId) {
        redirect("/auth/sign-in");
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {children}
        </div>
    );
}