// components/teacher/StudentCard.tsx
'use client';

import { useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { api } from '../../../../convex/_generated/api';
import { BookOpen, Mail } from 'lucide-react';

interface ClassItem {
  _id: string;
  _creationTime: number;
  name?: string;
  description?: string;
  teacherName?: string;
  code: string;
  teacherId: string;
  createdAt: number;
  students: Array<{
    studentId: string;
    joinedAt: number;
    status: string;
  }>;
}

interface StudentCardProps {
  studentId: string;
  joinedAt: number;
  classes: ClassItem[];
  index: number;
}

export function StudentCard({ studentId, joinedAt, classes, index }: StudentCardProps) {
  const router = useRouter();

  // 获取学生 profile
  const profile = useQuery(api.students.getStudentProfile, { studentId });

  // 生成显示名称
  const displayName = profile?.firstName
    ? `${profile.firstName}${profile.lastName ? ' ' + profile.lastName : ''}`
    : `Student ${studentId.slice(0, 8)}`;

  // 获取头像首字母
  const avatarLetter = profile?.firstName
    ? profile.firstName.charAt(0).toUpperCase()
    : studentId.charAt(0).toUpperCase();

  // 获取学生邮箱
  const studentEmail = profile?.email || `${studentId.slice(0, 12)}@student.edu`;

  return (
    <div
      className="student-card"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* 学生头像 - 居中 */}
      <div className="student-avatar-wrapper" style={{ textAlign: 'center' }}>
        {profile?.avatar ? (
          <img
            src={profile.avatar}
            alt={displayName}
            className="student-avatar-image"
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              objectFit: 'cover',
              margin: '0 auto',
            }}
          />
        ) : (
          <div className="student-avatar" style={{ margin: '0 auto' }}>
            {avatarLetter}
          </div>
        )}
      </div>

      {/* 学生信息 - 居中 */}
      <div className="student-info" style={{ textAlign: 'center' }}>
        <h3 className="student-name">
          {displayName}
        </h3>

        {/* 邮箱地址 - 居中显示 */}
        <p className="student-email" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          fontSize: '13px',
          color: '#6b7280',
          marginTop: '8px',
        }}>
          <Mail size={14} />
          <span>{studentEmail}</span>
        </p>
      </div>

      {/* 课程列表 */}
      <div className="student-classes">
        <div className="student-classes-header">
          <BookOpen size={16} />
          <span>Enrolled Classes ({classes.length})</span>
        </div>
        <div className="student-classes-list">
          {classes.map((classItem: ClassItem) => (
            <div
              key={classItem._id}
              className="student-class-badge"
              onClick={() => router.push(`/dashboard/teacher/class/${classItem._id}`)}
            >
              <BookOpen size={12} />
              <span>{classItem.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 加入日期 */}
      <div className="student-joined">
        Joined: {new Date(joinedAt).toLocaleDateString()}
      </div>
    </div>
  );
}