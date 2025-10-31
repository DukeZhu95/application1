'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StudentTimetable() {
  const router = useRouter();
  const { user } = useUser();
  const [currentDate, setCurrentDate] = useState(new Date());

  // 获取学生的课程安排
  const schedules = useQuery(
    api.classroomSchedules.getStudentSchedules,
    user?.id ? { studentId: user.id } : 'skip'
  );

  // 月份导航
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // 获取月份信息
  const monthName = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // 生成日历网格
  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendar = [];
    let day = 1;

    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDay) {
          week.push(null);
        } else if (day > daysInMonth) {
          week.push(null);
        } else {
          week.push(day);
          day++;
        }
      }
      calendar.push(week);
      if (day > daysInMonth) break;
    }

    return calendar;
  };

  // 获取某一天的课程
  const getCoursesForDate = (day: number | null) => {
    if (!day || !schedules) return [];

    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayOfWeek = date.getDay();

    return schedules.filter(schedule => {
      const scheduleDays = schedule.daysOfWeek || [];
      return scheduleDays.includes(dayOfWeek);
    });
  };

  // 获取课程颜色（天蓝色系）
  const getCourseColor = (index: number) => {
    const colors = [
      'bg-sky-500',      // 天蓝
      'bg-cyan-500',     // 青色
      'bg-blue-500',     // 蓝色
      'bg-teal-500',     // 蓝绿
      'bg-indigo-500',   // 靛蓝
      'bg-violet-500',   // 紫罗兰
      'bg-emerald-500',  // 祖母绿
      'bg-lime-500',     // 青柠
    ];
    return colors[index % colors.length];
  };

  const calendar = generateCalendar();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const isCurrentMonth =
    currentDate.getMonth() === today.getMonth() &&
    currentDate.getFullYear() === today.getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-100">
      {/* Header */}
      <div className="bg-sky-500/90 backdrop-blur-md border-b border-sky-400/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-white hover:text-sky-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back</span>
            </button>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              My Timetable
            </h1>
            <div className="w-20"></div> {/* Spacer for alignment */}
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-sky-200 p-6 shadow-xl">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-sky-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-6 w-6 text-sky-600" />
            </button>

            <h2 className="text-3xl font-bold text-sky-700">
              {monthName}
            </h2>

            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-sky-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-6 w-6 text-sky-600" />
            </button>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-sky-700 font-semibold text-sm py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendar.map((week, weekIndex) => (
              week.map((day, dayIndex) => {
                const courses = getCoursesForDate(day);
                const isToday =
                  isCurrentMonth &&
                  day === today.getDate();

                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`
                      min-h-[120px] rounded-xl p-3 transition-all
                      ${day
                      ? 'bg-sky-50 hover:bg-sky-100 border border-sky-200'
                      : 'bg-transparent'
                    }
                      ${isToday
                      ? 'ring-2 ring-sky-500 ring-offset-2 shadow-lg'
                      : ''
                    }
                    `}
                  >
                    {day && (
                      <>
                        {/* Date Number */}
                        <div className={`
                          text-sm font-semibold mb-2
                          ${isToday
                          ? 'text-sky-600 bg-sky-100 rounded-full w-7 h-7 flex items-center justify-center'
                          : 'text-gray-700'
                        }
                        `}>
                          {day}
                        </div>

                        {/* Course Bars */}
                        <div className="space-y-1">
                          {courses.slice(0, 3).map((schedule, index) => (
                            <div
                              key={schedule._id}
                              className={`
                                ${getCourseColor(index)}
                                text-white text-xs px-2 py-1 rounded
                                truncate font-medium shadow-sm
                              `}
                              title={`${schedule.classroomName} - ${schedule.startTime}-${schedule.endTime}${schedule.location ? ' - ' + schedule.location : ''}`}
                            >
                              {schedule.classroomName}
                            </div>
                          ))}
                          {courses.length > 3 && (
                            <div className="text-xs text-sky-600 px-2 font-medium">
                              +{courses.length - 3} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            ))}
          </div>

          {/* Legend */}
          {schedules && schedules.length > 0 && (
            <div className="mt-8 pt-6 border-t border-sky-200">
              <h3 className="text-sky-700 font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                My Registered Courses
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {schedules.map((schedule, index) => (
                  <div
                    key={schedule._id}
                    className="flex items-center gap-3 bg-sky-50 rounded-lg p-3 border border-sky-200 hover:shadow-md transition-shadow"
                  >
                    <div className={`w-4 h-4 rounded ${getCourseColor(index)}`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-800 font-medium truncate">
                        {schedule.classroomName}
                      </div>
                      <div className="text-sky-600 text-sm">
                        {schedule.startTime} - {schedule.endTime}
                        {schedule.location && ` • ${schedule.location}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {(!schedules || schedules.length === 0) && (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-sky-300 mx-auto mb-4" />
              <p className="text-sky-700 text-lg font-medium">No scheduled courses yet</p>
              <p className="text-sky-500 mt-2">
                Course schedules will appear here once your teachers add them
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}