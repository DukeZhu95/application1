import { UserButton } from "@clerk/nextjs";
import { ClassCodeInput } from "@/app/components/shared/class-code-input";

export default function TeacherDashboard() {
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
                    <div className="text-center">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Create Your Classroom
                        </h2>
                        <p className="text-gray-600 mb-8">
                            Generate a class code for your students to join
                        </p>
                    </div>
                    <ClassCodeInput userRole="teacher"/>
                </div>

                {/*<div className="grid gap-4">*/}
                {/*    <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">*/}
                {/*        Create New Task*/}
                {/*    </button>*/}
                {/*    <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">*/}
                {/*        View Class Progress*/}
                {/*    </button>*/}
                {/*</div>*/}
            </main>
        </div>
    );
}