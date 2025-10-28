'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { CustomUserMenu } from '@/app/dashboard/student/custom-user-menu';
import { useUser } from '@clerk/nextjs';

interface ClassroomHeaderProps {
  code: string;
}

export function ClassroomHeader({ code }: ClassroomHeaderProps) {
  const router = useRouter();
  const { user } = useUser();
  const classroom = useQuery(api.classes.getClassInfo, { code });

  const profile = useQuery(
    api.students.getStudentProfile,
    user?.id ? { studentId: user.id } : 'skip'
  );

  if (!classroom) {
    return (
      <nav className="glass-student-nav">
        <div className="container">
          <div className="glass-student-nav-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => router.push('/dashboard/student/classes')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  padding: '0.75rem 1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  color: '#1a202c',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                  e.currentTarget.style.transform = 'translateX(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <ArrowLeft size={20} />
                Back
              </button>
              <div className="glass-student-nav-title" style={{ marginLeft: '1rem' }}>
                <div className="glass-student-nav-icon">
                  <BookOpen size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <h1>Loading...</h1>
                  <p className="glass-student-nav-subtitle">Loading class information</p>
                </div>
              </div>
            </div>
            <div className="glass-student-user-section">
              <CustomUserMenu
                afterSignOutUrl="/auth/sign-in"
                profile={profile}
              />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="glass-student-nav">
      <div className="container">
        <div className="glass-student-nav-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => router.push('/dashboard/student/classes')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                padding: '0.75rem 1.25rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '0.95rem',
                fontWeight: '600',
                color: '#1a202c',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                e.currentTarget.style.transform = 'translateX(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <ArrowLeft size={20} />
              Back
            </button>

            <div className="glass-student-nav-title" style={{ marginLeft: '1rem' }}>
              <div className="glass-student-nav-icon">
                <BookOpen size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h1>{classroom.name}</h1>
                <p className="glass-student-nav-subtitle">
                  📚 {code} | 👨‍🏫 {classroom.students?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-student-user-section">
            <CustomUserMenu
              afterSignOutUrl="/auth/sign-in"
              profile={profile}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}