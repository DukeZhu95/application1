'use client';

import { useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { api } from '../../../../convex/_generated/api';
import { Clock, BookOpen, Calendar } from 'lucide-react';

interface TodayScheduleProps {
  teacherId: string;
}

export function TodaySchedule({ teacherId }: TodayScheduleProps) {
  const router = useRouter();

  // 获取教师的所有课程安排
  const schedules = useQuery(
    api.schedule.getTeacherSchedules,
    { teacherId }
  );

  // 获取今天是星期几 (0=Sunday, 6=Saturday)
  const today = new Date();
  const todayDayOfWeek = today.getDay();

  // 筛选今天的课程
  const todayCourses = schedules?.filter(
    (schedule) => schedule.dayOfWeek === todayDayOfWeek
  ) || [];

  // 按开始时间排序
  const sortedCourses = [...todayCourses].sort((a, b) => {
    return a.startTime.localeCompare(b.startTime);
  });

  const handleViewSchedule = () => {
    router.push('/dashboard/teacher/schedule');
  };

  if (!schedules) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ fontSize: '14px', opacity: 0.6 }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '16px' }}>
      {sortedCourses.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '32px 20px',
            background: 'rgba(139, 92, 246, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(139, 92, 246, 0.2)',
          }}
        >
          <Calendar size={40} style={{ color: '#a78bfa', opacity: 0.5, marginBottom: '12px' }} />
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '6px' }}>
            No Classes Today
          </div>
          <div style={{ fontSize: '13px', opacity: 0.7, marginBottom: '16px' }}>
            Enjoy your day off! 🎉
          </div>
          <button
            onClick={handleViewSchedule}
            style={{
              background: 'rgba(139, 92, 246, 0.8)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              color: '#fff',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(139, 92, 246, 1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(139, 92, 246, 0.8)';
            }}
          >
            View Full Schedule
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sortedCourses.map((course) => (
            <div
              key={course._id}
              style={{
                background: `${course.color}20`,
                border: `1px solid ${course.color}60`,
                borderRadius: '10px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
              onClick={handleViewSchedule}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 4px 12px ${course.color}40`;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: course.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <BookOpen size={20} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: course.color,
                    marginBottom: '4px',
                  }}
                >
                  {course.courseName}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    opacity: 0.9,
                  }}
                >
                  <Clock size={12} />
                  <span>
                    {course.startTime} - {course.endTime}
                  </span>
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={handleViewSchedule}
            style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '8px',
              padding: '10px',
              color: '#a78bfa',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginTop: '4px',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
            }}
          >
            View Full Schedule →
          </button>
        </div>
      )}
    </div>
  );
}