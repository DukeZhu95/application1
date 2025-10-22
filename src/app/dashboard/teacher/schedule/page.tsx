'use client';

import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { api } from '../../../../../convex/_generated/api';
import { CustomUserMenu } from '@/app/dashboard/teacher/custom-user-menu';
import {
  ArrowLeft,
  Calendar,
  Clock,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import '@/styles/components/teacher-dashboard-glass.css';
import { useState } from 'react';

// 课程数据
const WEEKLY_SCHEDULE = [
  {
    day: 3, // 周三 (0=周日, 1=周一, ..., 6=周六)
    courses: [
      {
        name: 'ACG100',
        startTime: '17:30',
        endTime: '18:00',
        color: '#8b5cf6', // 紫色
      },
      {
        name: 'UKL100',
        startTime: '18:00',
        endTime: '18:30',
        color: '#ec4899', // 粉色
      },
    ],
  },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function TeacherSchedulePage() {
  const { user } = useUser();
  const router = useRouter();
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  const profile = useQuery(
    api.teachers.getTeacherProfile,
    user?.id ? { teacherId: user.id } : 'skip'
  );

  // 获取本周的日期
  const getWeekDates = (offset: number = 0) => {
    const today = new Date();
    const currentDay = today.getDay();
    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - currentDay + offset * 7);

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(firstDayOfWeek);
      date.setDate(firstDayOfWeek.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const weekDates = getWeekDates(currentWeekOffset);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 检查某天是否有课程
  const getCoursesForDay = (dayIndex: number) => {
    const schedule = WEEKLY_SCHEDULE.find((s) => s.day === dayIndex);
    return schedule?.courses || [];
  };

  // 检查是否是今天
  const isToday = (date: Date) => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() === today.getTime();
  };

  return (
    <div className="glass-dashboard-container teacher-dashboard">
      {/* 动态背景 */}
      <div className="glass-background">
        <div className="glass-bg-gradient-1"></div>
        <div className="glass-bg-gradient-2"></div>
        <div className="glass-bg-gradient-3"></div>
      </div>

      {/* 导航栏 */}
      <nav className="glass-nav">
        <div className="container">
          <div className="glass-nav-content">
            <div className="glass-nav-title">
              <button
                onClick={() => router.back()}
                className="glass-back-button"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  marginRight: '16px',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <ArrowLeft size={18} />
                <span>Back</span>
              </button>
              <div className="glass-nav-icon">
                <Calendar size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h1>Class Schedule</h1>
                <p className="glass-nav-subtitle">View your weekly teaching schedule</p>
              </div>
            </div>
            <div className="glass-user-section">
              <CustomUserMenu afterSignOutUrl="/auth/sign-in" profile={profile} />
            </div>
          </div>
        </div>
      </nav>

      <main className="container glass-main">
        {/* 日程表卡片 */}
        <div className="glass-section" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* 周导航 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              padding: '16px 20px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <button
              onClick={() => setCurrentWeekOffset(currentWeekOffset - 1)}
              style={{
                background: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '12px',
                padding: '10px',
                cursor: 'pointer',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
              }}
            >
              <ChevronLeft size={20} />
            </button>

            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                {weekDates[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <p style={{ fontSize: '14px', opacity: 0.7 }}>
                {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>

            <button
              onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)}
              style={{
                background: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '12px',
                padding: '10px',
                cursor: 'pointer',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* 日历网格 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '12px',
            }}
          >
            {weekDates.map((date, index) => {
              const courses = getCoursesForDay(index);
              const hasClasses = courses.length > 0;
              const isTodayDate = isToday(date);

              return (
                <div
                  key={index}
                  style={{
                    background: isTodayDate
                      ? 'rgba(139, 92, 246, 0.15)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: isTodayDate
                      ? '2px solid rgba(139, 92, 246, 0.5)'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    padding: '16px',
                    minHeight: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s',
                  }}
                >
                  {/* 日期头部 */}
                  <div style={{ marginBottom: '12px', textAlign: 'center' }}>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        opacity: 0.7,
                        marginBottom: '4px',
                        color: hasClasses ? '#a78bfa' : 'inherit',
                      }}
                    >
                      {DAYS[index]}
                    </div>
                    <div
                      style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: isTodayDate ? '#a78bfa' : 'white',
                      }}
                    >
                      {date.getDate()}
                    </div>
                  </div>

                  {/* 课程列表 */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {courses.length > 0 ? (
                      courses.map((course, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: `${course.color}30`,
                            border: `1px solid ${course.color}60`,
                            borderRadius: '10px',
                            padding: '10px',
                            transition: 'all 0.2s',
                            cursor: 'pointer',
                          }}
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
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              marginBottom: '6px',
                            }}
                          >
                            <BookOpen size={14} color={course.color} />
                            <span
                              style={{
                                fontSize: '13px',
                                fontWeight: '700',
                                color: course.color,
                              }}
                            >
                              {course.name}
                            </span>
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              opacity: 0.9,
                            }}
                          >
                            <Clock size={12} />
                            <span>
                              {course.startTime} - {course.endTime}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div
                        style={{
                          textAlign: 'center',
                          opacity: 0.4,
                          fontSize: '12px',
                          marginTop: '20px',
                        }}
                      >
                        No classes
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 课程图例 */}
          <div
            style={{
              marginTop: '24px',
              padding: '16px 20px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', opacity: 0.8 }}>
              Course Legend
            </h4>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    background: '#8b5cf6',
                  }}
                ></div>
                <span style={{ fontSize: '13px' }}>ACG100 - Advanced Computing</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    background: '#ec4899',
                  }}
                ></div>
                <span style={{ fontSize: '13px' }}>UKL100 - Introduction to UKL</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}