// convex/classroomSchedules.ts
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

/**
 * 获取学生的所有课程安排
 * 用于学生课程表页面
 */
export const getStudentSchedules = query({
  args: {
    studentId: v.string()
  },
  handler: async (ctx, args) => {
    // 1. 获取所有班级
    const allClassrooms = await ctx.db.query("classrooms").collect();

    // 2. 筛选出学生加入的班级
    const studentClassrooms = allClassrooms.filter(classroom =>
      classroom.students?.some(student => student.studentId === args.studentId)
    );

    if (studentClassrooms.length === 0) {
      return [];
    }

    // 3. 获取这些班级的所有课程安排
    const allSchedules = [];

    for (const classroom of studentClassrooms) {
      const schedules = await ctx.db
        .query("classroomSchedules")
        .withIndex("by_classroom", (q) => q.eq("classroomId", classroom._id))
        .collect();

      // 为每个schedule添加班级信息
      for (const schedule of schedules) {
        allSchedules.push({
          ...schedule,
          classroomId: classroom._id,
          classroomName: classroom.name || 'Unnamed Class',
          classroomCode: classroom.code,
        });
      }
    }

    return allSchedules;
  },
});

/**
 * 获取教师的所有课程安排（基于班级）
 * 用于教师查看所有班级的上课时间
 */
export const getTeacherClassroomSchedules = query({
  args: {
    teacherId: v.string()
  },
  handler: async (ctx, args) => {
    // 1. 获取教师的所有班级
    const classrooms = await ctx.db
      .query("classrooms")
      .filter((q) => q.eq(q.field("teacherId"), args.teacherId))
      .collect();

    if (classrooms.length === 0) {
      return [];
    }

    // 2. 获取这些班级的所有课程安排
    const allSchedules = [];

    for (const classroom of classrooms) {
      const schedules = await ctx.db
        .query("classroomSchedules")
        .withIndex("by_classroom", (q) => q.eq("classroomId", classroom._id))
        .collect();

      // 为每个schedule添加班级信息
      for (const schedule of schedules) {
        allSchedules.push({
          ...schedule,
          classroomId: classroom._id,
          classroomName: classroom.name || 'Unnamed Class',
          classroomCode: classroom.code,
        });
      }
    }

    return allSchedules;
  },
});

/**
 * 创建课程安排（教师）
 */
export const createClassroomSchedule = mutation({
  args: {
    classroomId: v.id("classrooms"),
    daysOfWeek: v.array(v.number()), // [1, 3, 5] = 周一、三、五
    startTime: v.string(),            // "09:00"
    endTime: v.string(),              // "10:30"
    location: v.optional(v.string()), // "Room 101"
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // 验证是否是该班级的教师
    const classroom = await ctx.db.get(args.classroomId);
    if (!classroom || classroom.teacherId !== identity.subject) {
      throw new Error("Not authorized to create schedule for this classroom");
    }

    return await ctx.db.insert("classroomSchedules", {
      classroomId: args.classroomId,
      daysOfWeek: args.daysOfWeek,
      startTime: args.startTime,
      endTime: args.endTime,
      location: args.location,
      createdAt: Date.now(),
    });
  },
});

/**
 * 更新课程安排（教师）
 */
export const updateClassroomSchedule = mutation({
  args: {
    scheduleId: v.id("classroomSchedules"),
    daysOfWeek: v.array(v.number()),
    startTime: v.string(),
    endTime: v.string(),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) throw new Error("Schedule not found");

    // 验证是否是该班级的教师
    const classroom = await ctx.db.get(schedule.classroomId);
    if (!classroom || classroom.teacherId !== identity.subject) {
      throw new Error("Not authorized to update this schedule");
    }

    await ctx.db.patch(args.scheduleId, {
      daysOfWeek: args.daysOfWeek,
      startTime: args.startTime,
      endTime: args.endTime,
      location: args.location,
    });

    return schedule;
  },
});

/**
 * 删除课程安排（教师）
 */
export const deleteClassroomSchedule = mutation({
  args: {
    scheduleId: v.id("classroomSchedules"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) throw new Error("Schedule not found");

    // 验证是否是该班级的教师
    const classroom = await ctx.db.get(schedule.classroomId);
    if (!classroom || classroom.teacherId !== identity.subject) {
      throw new Error("Not authorized to delete this schedule");
    }

    await ctx.db.delete(args.scheduleId);
    return schedule;
  },
});

/**
 * 获取特定班级的所有课程安排
 */
export const getClassroomSchedules = query({
  args: {
    classroomId: v.id("classrooms"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("classroomSchedules")
      .withIndex("by_classroom", (q) => q.eq("classroomId", args.classroomId))
      .collect();
  },
});