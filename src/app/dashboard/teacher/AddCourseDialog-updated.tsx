'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { X } from 'lucide-react';
import { Id } from '../../../../convex/_generated/dataModel';
import { toast } from '@/app/components/ui/use-toast';

interface AddCourseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const COLORS = [
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#10B981', // Green
  '#F59E0B', // Orange
  '#EF4444', // Red
  '#6366F1', // Indigo
  '#14B8A6', // Teal
];

const DAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AddCourseDialog({ isOpen, onClose, onSuccess }: AddCourseDialogProps) {
  const { user } = useUser();

  // 获取教师的所有班级
  const classrooms = useQuery(
    api.classes.getTeacherClasses,
    user?.id ? { teacherId: user.id } : 'skip'
  );

  // Mutations
  const addTeacherSchedule = useMutation(api.schedule.addTeacherSchedule);
  const addClassroomSchedule = useMutation(api.classroomSchedules.createClassroomSchedule);

  // Form state
  const [courseName, setCourseName] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState<string>('');
  const [selectedDays, setSelectedDays] = useState<number[]>([1]); // 默认周一
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCourseName('');
      setSelectedClassroom('');
      setSelectedDays([1]);
      setStartTime('09:00');
      setEndTime('10:00');
      setLocation('');
      setSelectedColor(COLORS[0]);
      setError('');
    }
  }, [isOpen]);

  // Toggle day selection
  const toggleDay = (day: number) => {
    setSelectedDays(prev => {
      if (prev.includes(day)) {
        // 至少保留一天
        if (prev.length === 1) return prev;
        return prev.filter(d => d !== day);
      } else {
        return [...prev, day].sort();
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!user?.id) {
        throw new Error('Not authenticated');
      }

      if (!courseName.trim()) {
        throw new Error('Please enter a course name');
      }

      if (!selectedClassroom) {
        throw new Error('Please select a classroom');
      }

      if (selectedDays.length === 0) {
        throw new Error('Please select at least one day');
      }

      if (startTime >= endTime) {
        throw new Error('End time must be after start time');
      }

      // 1. 为每一天添加到 teacherSchedules（保持现有功能）
      for (const day of selectedDays) {
        await addTeacherSchedule({
          courseName,
          dayOfWeek: day,
          startTime,
          endTime,
          color: selectedColor,
        });
      }

      // 2. 添加到 classroomSchedules（新功能 - 学生可见）
      await addClassroomSchedule({
        classroomId: selectedClassroom as Id<'classrooms'>,
        daysOfWeek: selectedDays,
        startTime,
        endTime,
        location: location.trim() || undefined,
      });

      // Success
      toast({
        title: 'Success',
        description: 'Course added successfully',
      });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Error adding course:', err);
      setError(err.message || 'Failed to add course');
      toast({
        title: 'Error',
        description: err.message || 'Failed to add course',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 颜色强制显示样式 */}
      <style dangerouslySetInnerHTML={{__html: `
        .color-picker-btn {
          background: var(--btn-color) !important;
          background-color: var(--btn-color) !important;
          background-image: none !important;
        }
        ${COLORS.map((c, i) => `
          .color-picker-btn:nth-child(${i + 1}) {
            background: ${c} !important;
            background-color: ${c} !important;
          }
        `).join('\n')}
      `}} />

      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl border border-purple-200 p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Close button */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Add New Course</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Course Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Name
              </label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g., ACG100"
                className="w-full px-4 py-2 bg-purple-50 border-2 border-purple-200 rounded-xl text-gray-800 placeholder-gray-400 focus:bg-purple-100 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-100"
                required
              />
            </div>

            {/* Select Classroom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Classroom
              </label>
              <select
                value={selectedClassroom}
                onChange={(e) => setSelectedClassroom(e.target.value)}
                className="w-full px-4 py-2 bg-purple-50 border-2 border-purple-200 rounded-xl text-gray-800 focus:bg-purple-100 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-100"
                required
              >
                <option value="">Choose a classroom...</option>
                {classrooms?.map((classroom) => (
                  <option key={classroom._id} value={classroom._id} className="bg-white">
                    {classroom.name || classroom.code} ({classroom.students.length} students)
                  </option>
                ))}
              </select>
              {classrooms?.length === 0 && (
                <p className="mt-1 text-sm text-gray-500">
                  No classrooms yet. Create a classroom first.
                </p>
              )}
            </div>

            {/* Days of Week */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Days of Week
              </label>
              <div className="grid grid-cols-7 gap-2">
                {DAYS.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={`
                      px-2 py-2 rounded-lg text-sm font-semibold transition-all
                      ${selectedDays.includes(day.value)
                      ? 'bg-purple-600 text-white shadow-md scale-105'
                      : 'bg-purple-50 text-gray-600 hover:bg-purple-100 border-2 border-purple-200'
                    }
                    `}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-600">
                Selected: {selectedDays.length === 0
                ? 'None'
                : selectedDays.map(d => DAYS_FULL[d]).join(', ')}
              </p>
            </div>

            {/* Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-2 bg-purple-50 border-2 border-purple-200 rounded-xl text-gray-800 focus:bg-purple-100 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-2 bg-purple-50 border-2 border-purple-200 rounded-xl text-gray-800 focus:bg-purple-100 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-100"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location (Optional)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Room 101, Lab A"
                className="w-full px-4 py-2 bg-purple-50 border-2 border-purple-200 rounded-xl text-gray-800 placeholder-gray-400 focus:bg-purple-100 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-100"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="grid grid-cols-8 gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className="color-picker-btn w-10 h-10 rounded-lg transition-all"
                    style={{
                      backgroundColor: color,
                      background: color,
                      backgroundImage: 'none',
                      '--btn-color': color,
                      borderColor: selectedColor === color ? '#1f2937' : '#d1d5db',
                      borderWidth: '2px',
                      borderStyle: 'solid',
                      transform: selectedColor === color ? 'scale(1.1)' : 'scale(1)',
                      boxShadow: selectedColor === color ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none',
                    } as React.CSSProperties}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-transparent border-2 border-purple-200 text-purple-600 rounded-lg transition-colors hover:bg-purple-50 hover:border-purple-400 font-semibold"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-gradient-to-br from-purple-600 to-purple-400 text-white rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Course'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}