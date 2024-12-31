import { UserButton } from '@clerk/nextjs';

export default async function DashboardPage() {
  return (
    <div className="min-h-screen bg-white">
      {' '}
      {/* 改为白色背景 */}
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-black">
              {' '}
              {/* 明确设置黑色文字 */}
              Classroom Task Manager
            </h1>
            <div className="flex items-center">
              <UserButton />
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center space-y-6">
          <h2 className="text-xl font-semibold text-black">
            Select your role:
          </h2>

          <div className="flex gap-4 justify-center">
            <a
              href="/dashboard/teacher"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Teacher Dashboard
            </a>
            <a
              href="/dashboard/student"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Student Dashboard
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
