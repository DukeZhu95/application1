import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const user = await currentUser();

    if (!user) {
        redirect("/auth/sign-in");
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
                <h1 className="text-2xl font-bold text-center mb-6">
                    欢迎, {user.firstName || '用户'}
                </h1>

                <div className="space-y-4">
                    <a
                        href="/dashboard/teacher"
                        className="w-full block text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                        我是教师
                    </a>

                    <a
                        href="/dashboard/student"
                        className="w-full block text-center bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                        我是学生
                    </a>
                </div>
            </div>
        </div>
    );
}