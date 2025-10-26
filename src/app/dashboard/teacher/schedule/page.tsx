'use client';

import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { useRouter } from 'next/navigation';
import { api } from '../../../../../convex/_generated/api';
import { ScheduleCourseDialog } from '@/app/dashboard/teacher/schedule-course-dialog';
import { Id } from '../../../../../convex/_generated/dataModel';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  X,
} from 'lucide-react';
import '@/styles/components/teacher-dashboard-glass.css';
import { useState } from 'react';
import { toast } from '@/app/components/ui/use-toast';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface CourseSchedule {
  _id: Id<'teacherSchedules'>;
  courseName: string;
  startTime: string;
  endTime: string;
  color: string;
  dayOfWeek: number;
}

interface DayDetails {
  date: Date;
  courses: CourseSchedule[];
}

export default function TeacherSchedulePage() {
  const { user } = useUser();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseSchedule | undefined>();
  const [selectedDay, setSelectedDay] = useState<DayDetails | null>(null);

  const profile = useQuery(
    api.teachers.getTeacherProfile,
    user?.id ? { teacherId: user.id } : 'skip'
  );

  const schedules = useQuery(
    api.schedule.getTeacherSchedules,
    user?.id ? { teacherId: user.id } : 'skip'
  ) as CourseSchedule[] | undefined;

  const deleteSchedule = useMutation(api.schedule.deleteTeacherSchedule);

  // 获取当月的所有日期
  const getMonthDates = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const dates: (Date | null)[] = [];

    // 填充月初空白
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      dates.push(null);
    }

    // 填充当月日期
    for (let day = 1; day <= lastDay.getDate(); day++) {
      dates.push(new Date(year, month, day));
    }

    return dates;
  };

  // 获取某天的课程
  const getCoursesForDate = (date: Date): CourseSchedule[] => {
    if (!schedules) return [];
    const dayOfWeek = date.getDay();
    return schedules.filter(s => s.dayOfWeek === dayOfWeek);
  };

  // 检查是否是今天
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (date: Date) => {
    const courses = getCoursesForDate(date);
    if (courses.length > 0) {
      setSelectedDay({ date, courses });
    }
  };

  const handleDeleteCourse = async (courseId: Id<'teacherSchedules'>) => {
    try {
      await deleteSchedule({ scheduleId: courseId });
      toast({
        title: 'Success',
        description: 'Course deleted successfully',
      });
      setSelectedDay(null);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete course',
        variant: 'destructive',
      });
    }
  };

  const handleEditCourse = (course: CourseSchedule) => {
    setEditingCourse(course);
    setIsDialogOpen(true);
    setSelectedDay(null);
  };

  const monthDates = getMonthDates();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 头部 */}
      <div className="glass-panel border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard/teacher')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <h1 className="text-2xl font-bold text-white">Teaching Schedule</h1>
            </div>
            {/* 用户头像 */}
            <div className="flex items-center gap-3">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-purple-400 object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center border-2 border-purple-400">
                  <span className="text-white font-semibold text-sm">
                    {user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0] || '?'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 主内容 */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass-panel p-4">
          {/* 月份导航 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <h2 className="text-2xl font-bold text-white">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
            <button
              onClick={() => {
                setEditingCourse(undefined);
                setIsDialogOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Course
            </button>
          </div>

          {/* 星期标题 */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {DAYS.map(day => (
              <div
                key={day}
                className="text-center py-2 text-sm font-semibold text-purple-300"
              >
                {day}
              </div>
            ))}
          </div>

          {/* 日历网格 */}
          <div className="grid grid-cols-7 gap-1.5">
            {monthDates.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="h-20" />;
              }

              const courses = getCoursesForDate(date);
              const today = isToday(date);

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateClick(date)}
                  className={`
                    h-20 p-2 rounded-lg transition-all
                    ${today ? 'bg-purple-600/30 ring-2 ring-purple-500' : 'bg-white/5'}
                    ${courses.length > 0 ? 'hover:bg-white/20 cursor-pointer' : 'hover:bg-white/10'}
                  `}
                >
                  <div className="h-full flex flex-col">
                    <div className={`text-xs font-semibold mb-1 ${today ? 'text-purple-300' : 'text-white/80'}`}>
                      {date.getDate()}
                    </div>
                    {courses.length > 0 && (
                      <div className="flex-1 flex flex-col gap-1">
                        {courses.map(course => (
                          <div
                            key={course._id}
                            className="h-1.5 rounded-full"
                            style={{ backgroundColor: course.color }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 课程详情模态窗 */}
      {selectedDay && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setSelectedDay(null)}
        >
          <div
            className="bg-white rounded-xl border border-purple-200 p-6 max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {selectedDay.date.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </h3>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-3">
              {selectedDay.courses.map(course => (
                <div
                  key={course._id}
                  className="p-4 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors border border-purple-100"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4
                        className="text-lg font-bold mb-1"
                        style={{ color: course.color }}
                      >
                        {course.courseName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {course.startTime} - {course.endTime}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditCourse(course)}
                        className="p-2 hover:bg-white rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-blue-500" />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course._id)}
                        className="p-2 hover:bg-white rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 添加/编辑课程对话框 */}
      <ScheduleCourseDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingCourse(undefined);
        }}
        editingSchedule={editingCourse}
      />
    </div>
  );
}