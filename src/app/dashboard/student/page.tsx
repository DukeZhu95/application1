'use client';

import { UserButton } from '@clerk/nextjs';
import { JoinClassForm } from '@/app/dashboard/student/join-class-form';
import { StudentClassList } from '@/app/dashboard/student/class-list';

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-black">Student Dashboard</h1>
            <UserButton />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 加入班级部分 */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Join a class
              </h2>
              <p className="text-gray-600 mb-8">
                Input the class code to join a class
              </p>
            </div>
            <JoinClassForm />
          </div>

          {/* 班级列表部分 */}
          <div>
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                My classes
              </h2>
              <p className="text-gray-600">View all your enrolled classes</p>
            </div>
            <StudentClassList />
          </div>
        </div>
      </main>
    </div>
  );
}
