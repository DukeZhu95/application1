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
query({
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
type TaskSubmissionData = {
  content: string;
  submittedAt: number;
  status: string;
  attachmentUrl?: string;
  attachmentName?: string;
  storageId?: string;
};

export const submitTask = mutation({
  args: {
    taskId: v.id('tasks'),
    content: v.string(),
    storageId: v.optional(v.string()),
    fileName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authorized');

    const existingSubmission = await ctx.db
      .query('taskSubmissions')
      .withIndex('by_task_student', (q) =>
        q.eq('taskId', args.taskId).eq('studentId', identity.subject)
      )
      .first();

    const submissionData: TaskSubmissionData = {
      content: args.content,
      submittedAt: Date.now(),
      status: 'submitted',
    };

    // 如果有文件，添加文件相关字段
    if (args.storageId) {
      submissionData.storageId = args.storageId;
      // 使用空值合并运算符，如果是 null 就不设置这个字段
      const attachmentUrl = await ctx.storage.getUrl(args.storageId);
      attachmentUrl && (submissionData.attachmentUrl = attachmentUrl);
      submissionData.attachmentName = args.fileName;
    }

    if (existingSubmission) {
      // 处理现有文件
      if (existingSubmission.storageId) {
        await ctx.storage.delete(existingSubmission.storageId);
      }

      // 更新提交
      return await ctx.db.patch(existingSubmission._id, submissionData);
    }

    // 创建新提交
    return await ctx.db.insert('taskSubmissions', {
      ...submissionData,
      taskId: args.taskId,
      studentId: identity.subject,
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
    if (!identity) throw new Error('Not authenticated');

    // 获取任务信息以验证教师身份
    const task = await ctx.db.get(args.taskId);
    if (!task || task.teacherId !== identity.subject) {
      throw new Error('Not authorized to view submissions');
    }

    // 获取所有提交
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
    const task = await ctx.db.get(args.taskId);

    if (!task) {
      throw new Error(`Task not found: ${args.taskId}`);
    }

    return task;
  },
});

// 任务提交
export const getTaskSubmission = query({
  args: { taskId: v.id('tasks') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    return await ctx.db
      .query('taskSubmissions')
      .withIndex('by_task_student', (q) =>
        q.eq('taskId', args.taskId).eq('studentId', identity.subject)
      )
      .first();
  },
});

// 生成上传 URL
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
