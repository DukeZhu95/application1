import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// 创建新班级
export const createClass = mutation({
  args: {
    code: v.string(),
    teacherId: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 检查班级代码格式
    if (!/^[A-Z0-9]{6}$/.test(args.code)) {
      throw new Error('Invalid class code format');
    }

    if (!/[A-Z]/.test(args.code) || !/[0-9]/.test(args.code)) {
      throw new Error('Class code must contain both letters and numbers');
    }

    // 检查代码是否已存在
    const existingClass = await ctx.db
      .query('classrooms')
      .withIndex('by_code', (q) => q.eq('code', args.code))
      .first();

    if (existingClass) {
      throw new Error('Class code already exists');
    }

    // 创建班级
    return await ctx.db.insert('classrooms', {
      ...args,
      createdAt: Date.now(),
      students: [],
    });
  },
});

// 学生加入班级
export const joinClass = mutation({
  args: {
    code: v.string(),
    studentId: v.string(),
  },
  handler: async (ctx, args) => {
    // 查找课程
    const classroom = await ctx.db
      .query('classrooms')
      .withIndex('by_code', (q) => q.eq('code', args.code))
      .first();

    if (!classroom) {
      throw new Error('Classroom not found');
    }

    // 检查学生是否已经加入
    const isAlreadyJoined = classroom.students.some(
      (student) => student.studentId === args.studentId
    );

    if (isAlreadyJoined) {
      throw new Error('Already joined this class');
    }

    // 添加学生到课程
    await ctx.db.patch(classroom._id, {
      students: [
        ...classroom.students,
        {
          studentId: args.studentId,
          joinedAt: Date.now(),
          status: 'active',
        },
      ],
    });

    return classroom;
  },
});

// 检查班级代码是否存在
export const checkClassExists = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const classroom = await ctx.db
      .query('classrooms')
      .withIndex('by_code', (q) => q.eq('code', args.code))
      .first();

    // 返回更详细的信息
    if (!classroom) {
      return {
        exists: false,
        message: 'Class not found',
      };
    }

    return {
      exists: true,
      message: 'Class found',
      className: classroom.name,
    };
  },
});

// 保持现有的通过代码获取班级信息的查询
export const getClassInfo = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('classrooms')
      .withIndex('by_code', (q) => q.eq('code', args.code))
      .first();
  },
});

// 添加通过 ID 获取班级信息的查询
export const getClassById = query({
  args: { classId: v.id('classrooms') },
  handler: async (ctx, args) => {
    const classroom = await ctx.db.get(args.classId);
    if (!classroom) throw new Error('Class not found');
    return classroom;
  },
});

// 获取教师的班级列表
export const getTeacherClasses = query({
  args: { teacherId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('classrooms')
      .filter((q) => q.eq(q.field('teacherId'), args.teacherId))
      .collect();
  },
});

// 获取学生加入的班级列表
export const getStudentClasses = query({
  args: { studentId: v.string() },
  handler: async (ctx, args) => {
    // 先获取所有课程进行调试
    const allClasses = await ctx.db.query('classrooms').collect();

    console.log('All classes in database:', allClasses);
    console.log('Looking for studentId:', args.studentId);

    // 使用 searchIndex 查询
    const studentClasses = await ctx.db
      .query('classrooms')
      .withSearchIndex('by_student', (q) =>
        q.search('students', args.studentId)
      )
      .collect();

    console.log('Found classes using search index:', studentClasses);

    // 作为备用，手动过滤尝试
    const manuallyFiltered = allClasses.filter((classroom) =>
      classroom.students.some((student) => student.studentId === args.studentId)
    );

    console.log('Manually filtered classes:', manuallyFiltered);

    // 如果搜索索引方法失败，使用手动过滤的结果
    return studentClasses.length > 0 ? studentClasses : manuallyFiltered;
  },
});
