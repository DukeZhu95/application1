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
    storageIds: v.optional(v.array(v.string())),
    fileNames: v.optional(v.array(v.string())),
    keepExistingFiles: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const updateData: any = {
      title: args.title,
      description: args.description,
      dueDate: args.dueDate,
    };

    const allStorageIds: string[] = [];
    const allFileNames: string[] = [];
    const allFileUrls: string[] = [];

    // 1. 读取现有文件（兼容旧格式和新格式）
    let existingStorageIds: string[] = [];
    let existingFileNames: string[] = [];
    let existingFileUrls: string[] = [];

    if (task.storageIds && task.storageIds.length > 0) {
      // 新格式（数组）
      existingStorageIds = task.storageIds;
      existingFileNames = task.attachmentNames || [];
      existingFileUrls = task.attachmentUrls || [];
    } else if (task.storageId) {
      // 旧格式（单个）转换为数组
      existingStorageIds = [task.storageId];
      existingFileNames = task.attachmentName ? [task.attachmentName] : [];
      existingFileUrls = task.attachmentUrl ? [task.attachmentUrl] : [];
    }

    // 2. 保留指定的现有文件
    if (args.keepExistingFiles && args.keepExistingFiles.length > 0) {
      for (let i = 0; i < existingFileNames.length; i++) {
        if (args.keepExistingFiles.includes(existingFileNames[i])) {
          allStorageIds.push(existingStorageIds[i]);
          allFileNames.push(existingFileNames[i]);
          allFileUrls.push(existingFileUrls[i]);
        } else {
          // 删除不保留的文件
          try {
            await ctx.storage.delete(existingStorageIds[i]);
          } catch (error) {
            console.error('Failed to delete file:', error);
          }
        }
      }
    } else {
      // 如果没有指定保留，删除所有旧文件
      for (const storageId of existingStorageIds) {
        try {
          await ctx.storage.delete(storageId);
        } catch (error) {
          console.error('Failed to delete file:', error);
        }
      }
    }

    // 3. 添加新上传的文件
    if (args.storageIds && args.fileNames) {
      for (let i = 0; i < args.storageIds.length; i++) {
        const url = await ctx.storage.getUrl(args.storageIds[i]);
        if (url) {
          allStorageIds.push(args.storageIds[i]);
          allFileNames.push(args.fileNames[i]);
          allFileUrls.push(url);
        }
      }
    }

    // 4. 更新任务 - 使用新格式（数组）
    updateData.storageIds = allStorageIds;
    updateData.attachmentNames = allFileNames;
    updateData.attachmentUrls = allFileUrls;

    // 清除旧格式字段（可选，帮助迁移）
    updateData.storageId = undefined;
    updateData.attachmentName = undefined;
    updateData.attachmentUrl = undefined;

    await ctx.db.patch(args.taskId, updateData);

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

/**
 * 获取教师的所有任务
 * 用于 Tasks Tracking 组件
 */
export const getTeacherTasks = query({
  args: {
    teacherId: v.string()
  },
  handler: async (ctx, args) => {
    // 1. 获取教师的所有课程
    const classrooms = await ctx.db
      .query("classrooms")
      .filter((q) => q.eq(q.field("teacherId"), args.teacherId))
      .collect();

    // 2. 获取所有课程的任务
    const allTasks = [];
    for (const classroom of classrooms) {
      const tasks = await ctx.db
        .query("tasks")
        .withIndex("by_classroom", (q) => q.eq("classroomId", classroom._id))
        .collect();

      // 为每个任务添加课程信息和提交统计
      for (const task of tasks) {
        // 获取该任务的所有提交
        const submissions = await ctx.db
          .query("taskSubmissions")
          .withIndex("by_task", (q) => q.eq("taskId", task._id))
          .collect();

        allTasks.push({
          ...task,
          classId: classroom._id, // 为了兼容组件
          submissions: submissions, // 添加提交数组
        });
      }
    }

    // 3. 按截止日期排序（最近的在前）
    allTasks.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate - b.dueDate;
    });

    return allTasks;
  },
});

/**
 * 获取学生的所有任务
 * 用于学生Dashboard的任务列表
 */
export const getStudentTasks = query({
  args: {
    userId: v.string()
  },
  handler: async (ctx, args) => {
    // 1. 获取所有课程
    const allClassrooms = await ctx.db.query("classrooms").collect();

    // 2. 筛选出学生加入的课程
    const studentClassrooms = allClassrooms.filter(classroom =>
      classroom.students.some(student => student.studentId === args.userId)
    );

    if (studentClassrooms.length === 0) {
      return [];
    }

    // 3. 获取这些课程的所有任务
    const allTasks = [];

    for (const classroom of studentClassrooms) {
      // 获取该课程的所有激活任务
      const tasks = await ctx.db
        .query("tasks")
        .withIndex("by_classroom", (q) => q.eq("classroomId", classroom._id))
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect();

      // 为每个任务添加课程信息和提交状态
      for (const task of tasks) {
        // 检查学生是否已提交
        const submission = await ctx.db
          .query("taskSubmissions")
          .withIndex("by_task_student", (q) =>
            q.eq("taskId", task._id).eq("studentId", args.userId)
          )
          .first();

        allTasks.push({
          ...task,
          className: classroom.name || "Unnamed Class",
          classCode: classroom.code,
          isSubmitted: !!submission,
          submissionStatus: submission?.status || null,
          grade: submission?.grade || null,
          feedback: submission?.feedback || null,
        });
      }
    }

    // 4. 按截止日期排序
    allTasks.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;

      const now = Date.now();
      const aOverdue = a.dueDate < now;
      const bOverdue = b.dueDate < now;

      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;

      return a.dueDate - b.dueDate;
    });

    return allTasks;
  },
});