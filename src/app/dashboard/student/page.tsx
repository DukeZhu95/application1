'use client';

import { UserButton } from '@clerk/nextjs';
import { JoinClassForm } from '@/app/dashboard/student/join-class-form';
import { StudentClassList } from '@/app/dashboard/student/class-list';
import { RouteGuard } from '@/app/components/auth/route-guard';

export default function StudentDashboard() {
  return (
    <RouteGuard>
      <div className="dashboard-container">
        {/* 导航栏 */}
        <nav className="dashboard-nav">
          <div className="container">
            <div className="nav-content">
              <h1>Student Dashboard</h1>
              <UserButton afterSignOutUrl="/auth/sign-in" />
            </div>
          </div>
        </nav>

        {/* 主要内容 */}
        <main className="container">
          <div className="dashboard-grid">
            {/* 加入班级部分 */}
            <section className="dashboard-section">
              <div className="section-header">
                <h2>Join a class</h2>
                <p className="section-description">
                  Input the class code to join a class
                </p>
              </div>
              <JoinClassForm />
            </section>

            {/* 班级列表部分 */}
            <section className="dashboard-section">
              <div className="section-header">
                <h2>My classes</h2>
                <p className="section-description">
                  View all your enrolled classes
                </p>
              </div>
              <StudentClassList />
            </section>
          </div>
        </main>
      </div>
    </RouteGuard>
  );
}
