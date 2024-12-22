import { UserButton } from "@clerk/nextjs";
import { ClassCodeInput } from "@/app/components/shared/class-code-input";

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
                <div className="space-y-8">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Join a Classroom
                        </h2>
                        <p className="text-gray-600 mb-8">
                            Enter the class code provided by your teacher
                        </p>
                    </div>
                    <ClassCodeInput userRole="student" />
                </div>
            </main>
        </div>
    );
}