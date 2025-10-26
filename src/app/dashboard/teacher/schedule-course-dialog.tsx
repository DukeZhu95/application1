'use client';

import { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { X } from 'lucide-react';
import { toast } from '@/app/components/ui/use-toast';

interface CourseSchedule {
  _id: Id<'teacherSchedules'>;
  courseName: string;
  startTime: string;
  endTime: string;
  color: string;
  dayOfWeek: number;
}

interface ScheduleCourseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingSchedule?: CourseSchedule;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const PRESET_COLORS = [
  '#8b5cf6', // 紫色
  '#ec4899', // 粉色
  '#06b6d4', // 青色
  '#10b981', // 绿色
  '#f59e0b', // 橙色
  '#ef4444', // 红色
  '#6366f1', // 靛蓝
  '#14b8a6', // 青绿
];

export function ScheduleCourseDialog({
                                       isOpen,
                                       onClose,
                                       editingSchedule,
                                     }: ScheduleCourseDialogProps) {
  const [courseName, setCourseName] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState(1); // 默认周一
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [color, setColor] = useState(PRESET_COLORS[0]);

  const addSchedule = useMutation(api.schedule.addTeacherSchedule);
  const updateSchedule = useMutation(api.schedule.updateTeacherSchedule);

  // 当编辑模式时，填充表单
  useEffect(() => {
    if (editingSchedule) {
      setCourseName(editingSchedule.courseName);
      setDayOfWeek(editingSchedule.dayOfWeek);
      setStartTime(editingSchedule.startTime);
      setEndTime(editingSchedule.endTime);
      setColor(editingSchedule.color);
    } else {
      // 重置表单
      setCourseName('');
      setDayOfWeek(1);
      setStartTime('09:00');
      setEndTime('10:00');
      setColor(PRESET_COLORS[0]);
    }
  }, [editingSchedule, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证
    if (!courseName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a course name',
        variant: 'destructive',
      });
      return;
    }

    if (startTime >= endTime) {
      toast({
        title: 'Error',
        description: 'End time must be after start time',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingSchedule) {
        // 更新现有课程
        await updateSchedule({
          scheduleId: editingSchedule._id,
          courseName,
          dayOfWeek,
          startTime,
          endTime,
          color,
        });
        toast({
          title: 'Success',
          description: 'Course updated successfully',
        });
      } else {
        // 添加新课程
        await addSchedule({
          courseName,
          dayOfWeek,
          startTime,
          endTime,
          color,
        });
        toast({
          title: 'Success',
          description: 'Course added successfully',
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: editingSchedule
          ? 'Failed to update course'
          : 'Failed to add course',
        variant: 'destructive',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl border border-purple-200 p-6 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {editingSchedule ? 'Edit Course' : 'Add New Course'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 课程名称 */}
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
            />
          </div>

          {/* 星期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Day of Week
            </label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(Number(e.target.value))}
              className="w-full px-4 py-2 bg-purple-50 border-2 border-purple-200 rounded-xl text-gray-800 focus:bg-purple-100 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-100"
            >
              {DAYS_OF_WEEK.map((day) => (
                <option key={day.value} value={day.value} className="bg-white">
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          {/* 时间段 */}
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
              />
            </div>
          </div>

          {/* 颜色选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="grid grid-cols-8 gap-2">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => setColor(presetColor)}
                  className={`w-10 h-10 rounded-lg transition-all border-2 ${
                    color === presetColor
                      ? 'border-white scale-110 shadow-lg'
                      : 'border-transparent hover:scale-105 hover:border-white/30'
                  }`}
                  style={{
                    backgroundColor: presetColor,
                  }}
                  title={presetColor}
                />
              ))}
            </div>
          </div>

          {/* 按钮 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-transparent border-2 border-purple-200 text-purple-600 rounded-lg transition-colors hover:bg-purple-50 hover:border-purple-400 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-br from-purple-600 to-purple-400 text-white rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5 font-semibold"
            >
              {editingSchedule ? 'Update Course' : 'Add Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}