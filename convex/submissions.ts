import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// 获取学生的任务提交
export const getStudentSubmission = query({
  args: {
    taskId: v.id('tasks'),
    studentId: v.string(),
  },
  handler: async (ctx, args) => {
    const submission = await ctx.db
      .query('taskSubmissions')
      .withIndex('by_task_student', (q) =>
        q.eq('taskId', args.taskId).eq('studentId', args.studentId)
      )
      .first();

    return submission;
  },
});

// 获取任务的所有提交
export const getTaskSubmissions = query({
  args: { taskId: v.id('tasks') },
  handler: async (ctx, args) => {
    const submissions = await ctx.db
      .query('taskSubmissions')
      .withIndex('by_task', (q) => q.eq('taskId', args.taskId))
      .collect();

    return submissions;
  },
});

// ✅ 学生提交任务 - 支持多文件（最多5个）
export const submitTask = mutation({
  args: {
    taskId: v.id('tasks'),
    studentId: v.string(),
    content: v.string(),
    storageIds: v.optional(v.array(v.id('_storage'))),
    fileNames: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // 检查是否已经提交过
    const existingSubmission = await ctx.db
      .query('taskSubmissions')
      .withIndex('by_task_student', (q) =>
        q.eq('taskId', args.taskId).eq('studentId', args.studentId)
      )
      .first();

    // ✅ 防止修改已评分的作业
    if (existingSubmission && existingSubmission.status === 'graded') {
      throw new Error('Cannot modify a graded submission');
    }

    const submissionData: any = {
      content: args.content,
      submittedAt: Date.now(),
      status: 'submitted',
    };

    // ✅ 处理多个文件附件
    if (args.storageIds && args.storageIds.length > 0) {
      // 验证文件数量
      if (args.storageIds.length > 5) {
        throw new Error('Maximum 5 files allowed');
      }

      submissionData.storageIds = args.storageIds;
      submissionData.attachmentNames = args.fileNames;

      // 获取所有文件的 URL
      const urls = await Promise.all(
        args.storageIds.map(async (storageId) => {
          const url = await ctx.storage.getUrl(storageId);
          return url;
        })
      );
      submissionData.attachmentUrls = urls.filter((url): url is string => url !== null);
    }

    if (existingSubmission) {
      // 删除旧文件
      if (existingSubmission.storageIds) {
        await Promise.all(
          existingSubmission.storageIds.map((storageId) =>
            ctx.storage.delete(storageId)
          )
        );
      }
      // 向后兼容：也删除单文件字段
      if (existingSubmission.storageId) {
        await ctx.storage.delete(existingSubmission.storageId);
      }

      // 更新现有提交
      await ctx.db.patch(existingSubmission._id, submissionData);
      return existingSubmission._id;
    }

    // 创建新提交
    const submissionId = await ctx.db.insert('taskSubmissions', {
      ...submissionData,
      taskId: args.taskId,
      studentId: args.studentId,
    });

    return submissionId;
  },
});

// 教师批改任务
export const gradeSubmission = mutation({
  args: {
    taskId: v.id('tasks'),
    studentId: v.string(),
    grade: v.number(),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // 根据 taskId 和 studentId 查找 submission
    const submission = await ctx.db
      .query('taskSubmissions')
      .withIndex('by_task_student', (q) =>
        q.eq('taskId', args.taskId).eq('studentId', args.studentId)
      )
      .first();

    if (!submission) {
      throw new Error('Submission not found');
    }

    await ctx.db.patch(submission._id, {
      grade: args.grade,
      feedback: args.feedback,
      gradedAt: Date.now(),
      gradedBy: identity.subject,
      status: 'graded',
    });

    return submission._id;
  },
});

// 获取学生的所有提交
export const getStudentSubmissions = query({
  args: { studentId: v.string() },
  handler: async (ctx, args) => {
    const submissions = await ctx.db
      .query('taskSubmissions')
      .filter((q) => q.eq(q.field('studentId'), args.studentId))
      .collect();

    return submissions;
  },
});

// 获取班级所有学生的提交统计
export const getClassSubmissionStats = query({
  args: { classroomId: v.id('classrooms') },
  handler: async (ctx, args) => {
    // 获取班级的所有任务
    const tasks = await ctx.db
      .query('tasks')
      .withIndex('by_classroom', (q) => q.eq('classroomId', args.classroomId))
      .collect();

    const stats = [];

    for (const task of tasks) {
      const submissions = await ctx.db
        .query('taskSubmissions')
        .withIndex('by_task', (q) => q.eq('taskId', task._id))
        .collect();

      stats.push({
        taskId: task._id,
        taskTitle: task.title,
        totalSubmissions: submissions.length,
        gradedSubmissions: submissions.filter((s) => s.grade !== undefined)
          .length,
      });
    }

    return stats;
  },
});