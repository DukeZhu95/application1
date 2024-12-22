import { UserButton } from "@clerk/nextjs";

export default function StudentDashboard() {
    return (
        <div className="min-h-screen bg-white">
            <nav className="border-b">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between h-16 items-center">
                        <h1 className="text-2xl font-bold text-black">
                            Student Dashboard
                        </h1>
                        <UserButton />
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="text-center space-y-6">
                    <h2 className="text-xl font-semibold text-black">
                        Welcome, Student
                    </h2>
                    {/* 这里将添加学生功能，如：*/}
                    <div className="grid gap-4">
                        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            View Assignments
                        </button>
                        <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            Submit Work
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}