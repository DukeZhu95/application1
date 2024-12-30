// convex/tasks.ts
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// 创建新任务
export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    classroomId: v.id('classrooms'),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('You must be logged in to create a task');

    // 验证教师身份
    const classroom = await ctx.db.get(args.classroomId);
    if (!classroom || classroom.teacherId !== identity.subject) {
      throw new Error(
        'You are not authorized to create tasks in this classroom'
      );
    }

    // 创建任务
    return await ctx.db.insert('tasks', {
      ...args,
      teacherId: identity.subject,
      createdAt: Date.now(),
      status: 'active',
    });
  },
});

// 获取班级任务列表
export const getClassTasks = query({
  args: {
    classroomId: v.id('classrooms'),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('tasks')
      .withIndex('by_classroom', (q) => q.eq('classroomId', args.classroomId))
      .order('desc')
      .collect();
  },
});

// 获取任务详情
export const getStudentTaskStatus = query({
  args: {
    taskId: v.id('tasks'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('You must be logged in to view task status');

    // 获取任务信息
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error('Task not found');

    // 在这里可以添加获取学生完成状态的逻辑
    // 目前返回一个基础状态
    return {
      isSubmitted: false,
      submittedAt: null,
    };
  },
});

// 提交任务
export const submitTask = mutation({
  args: {
    taskId: v.id('tasks'),
    content: v.string(),
    attachmentUrl: v.optional(v.string()),
    attachmentName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authorized');

    // 检查任务是否存在
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error('Task not found');

    // 检查是否已提交
    const existingSubmission = await ctx.db
      .query('taskSubmissions')
      .withIndex('by_task_student', (q) =>
        q.eq('taskId', args.taskId).eq('studentId', identity.subject)
      )
      .first();

    if (existingSubmission) {
      // 更新现有提交
      return await ctx.db.patch(existingSubmission._id, {
        content: args.content,
        submittedAt: Date.now(),
      });
    }

    // 创建新提交
    return await ctx.db.insert('taskSubmissions', {
      taskId: args.taskId,
      studentId: identity.subject,
      content: args.content,
      submittedAt: Date.now(),
      status: 'submitted',
    });
  },
});

// 分数提交
export const gradeSubmission = mutation({
  args: {
    taskId: v.id('tasks'),
    studentId: v.string(),
    grade: v.number(),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authorized');

    // 验证是否是教师
    const task = await ctx.db.get(args.taskId);
    if (!task || task.teacherId !== identity.subject) {
      throw new Error('Not authorized to grade this task');
    }

    // 查找提交记录
    const submission = await ctx.db
      .query('taskSubmissions')
      .withIndex('by_task_student', (q) =>
        q.eq('taskId', args.taskId).eq('studentId', args.studentId)
      )
      .first();

    if (!submission) {
      throw new Error('Submission not found');
    }

    // 更新评分
    return await ctx.db.patch(submission._id, {
      grade: args.grade,
      feedback: args.feedback,
      status: 'graded',
      gradedAt: Date.now(),
      gradedBy: identity.subject,
    });
  },
});

// 获取任务的所有提交
export const getTaskSubmissions = query({
  args: { taskId: v.id('tasks') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authorized');

    // 验证是否是教师
    const task = await ctx.db.get(args.taskId);
    if (!task || task.teacherId !== identity.subject) {
      throw new Error('Not authorized to view submissions');
    }

    return await ctx.db
      .query('taskSubmissions')
      .withIndex('by_task', (q) => q.eq('taskId', args.taskId))
      .collect();
  },
});

// 删除任务
export const deleteTask = mutation({
  args: { taskId: v.id('tasks') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authorized');

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error('Task not found');

    await ctx.db.delete(args.taskId);
    return task;
  },
});

// 更新任务
export const updateTask = mutation({
  args: {
    taskId: v.id('tasks'),
    title: v.string(),
    description: v.string(),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 验证任务是否存在
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // 更新任务
    await ctx.db.patch(args.taskId, {
      title: args.title,
      description: args.description,
      dueDate: args.dueDate,
    });

    return task;
  },
});

// 获取任务
export const getTask = query({
  args: { taskId: v.id('tasks') },
  handler: async (ctx, args) => {
    console.log('getTask query called with:', args);
    const task = await ctx.db.get(args.taskId);
    console.log('Found task:', task);

    if (!task) {
      throw new Error(`Task not found: ${args.taskId}`);
    }

    return task;
  },
});
