import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// 获取教师的所有课程安排
export const getTeacherSchedules = query({
  args: { teacherId: v.string() },
  handler: async (ctx, args) => {
    const schedules = await ctx.db
      .query('teacherSchedules')
      .filter((q) => q.eq(q.field('teacherId'), args.teacherId))
      .collect();

    return schedules;
  },
});

// 添加课程安排
export const addTeacherSchedule = mutation({
  args: {
    courseName: v.string(),
    dayOfWeek: v.number(), // 0-6 (Sunday-Saturday)
    startTime: v.string(), // HH:MM format
    endTime: v.string(),   // HH:MM format
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const teacherId = identity.subject;

    const scheduleId = await ctx.db.insert('teacherSchedules', {
      teacherId,
      courseName: args.courseName,
      dayOfWeek: args.dayOfWeek,
      startTime: args.startTime,
      endTime: args.endTime,
      color: args.color,
      createdAt: Date.now(),
    });

    return scheduleId;
  },
});

// 更新课程安排
export const updateTeacherSchedule = mutation({
  args: {
    scheduleId: v.id('teacherSchedules'),
    courseName: v.string(),
    dayOfWeek: v.number(),
    startTime: v.string(),
    endTime: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) {
      throw new Error('Schedule not found');
    }

    if (schedule.teacherId !== identity.subject) {
      throw new Error('Not authorized');
    }

    await ctx.db.patch(args.scheduleId, {
      courseName: args.courseName,
      dayOfWeek: args.dayOfWeek,
      startTime: args.startTime,
      endTime: args.endTime,
      color: args.color,
    });

    return args.scheduleId;
  },
});

// 删除课程安排
export const deleteTeacherSchedule = mutation({
  args: {
    scheduleId: v.id('teacherSchedules'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) {
      throw new Error('Schedule not found');
    }

    if (schedule.teacherId !== identity.subject) {
      throw new Error('Not authorized');
    }

    await ctx.db.delete(args.scheduleId);
  },
});