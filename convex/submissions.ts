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
      .query('submissions')
      .filter((q) =>
        q.and(
          q.eq(q.field('taskId'), args.taskId),
          q.eq(q.field('studentId'), args.studentId)
        )
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
      .query('submissions')
      .filter((q) => q.eq(q.field('taskId'), args.taskId))
      .collect();

    return submissions;
  },
});

// 学生提交任务 - 更新为支持 storageId
export const submitTask = mutation({
  args: {
    taskId: v.id('tasks'),
    studentId: v.string(),
    submissionText: v.string(),
    submissionFiles: v.optional(
      v.array(
        v.object({
          name: v.string(),
          storageId: v.string(),  // ✅ 使用 storageId 而不是 url
          size: v.number(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    // 检查是否已经提交过
    const existingSubmission = await ctx.db
      .query('submissions')
      .filter((q) =>
        q.and(
          q.eq(q.field('taskId'), args.taskId),
          q.eq(q.field('studentId'), args.studentId)
        )
      )
      .first();

    if (existingSubmission) {
      // 更新现有提交
      await ctx.db.patch(existingSubmission._id, {
        submissionText: args.submissionText,
        submissionFiles: args.submissionFiles || [],
        submittedAt: Date.now(),
        status: 'submitted',
      });
      return existingSubmission._id;
    }

    // 创建新提交
    const submissionId = await ctx.db.insert('submissions', {
      taskId: args.taskId,
      studentId: args.studentId,
      submissionText: args.submissionText,
      submissionFiles: args.submissionFiles || [],
      submittedAt: Date.now(),
      status: 'submitted',
    });

    return submissionId;
  },
});

// 教师批改任务
export const gradeSubmission = mutation({
  args: {
    submissionId: v.id('submissions'),
    grade: v.number(),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    await ctx.db.patch(args.submissionId, {
      grade: args.grade,
      feedback: args.feedback,
      gradedAt: Date.now(),
      gradedBy: identity.subject,
      status: 'graded',
    });

    return args.submissionId;
  },
});

// 获取学生的所有提交
export const getStudentSubmissions = query({
  args: { studentId: v.string() },
  handler: async (ctx, args) => {
    const submissions = await ctx.db
      .query('submissions')
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
      .filter((q) => q.eq(q.field('classroomId'), args.classroomId))
      .collect();

    const stats = [];

    for (const task of tasks) {
      const submissions = await ctx.db
        .query('submissions')
        .filter((q) => q.eq(q.field('taskId'), task._id))
        .collect();

      stats.push({
        taskId: task._id,
        taskTitle: task.title,
        totalSubmissions: submissions.length,
        gradedSubmissions: submissions.filter((s) => s.grade !== undefined).length,
      });
    }

    return stats;
  },
});