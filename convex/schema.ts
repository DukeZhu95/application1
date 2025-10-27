import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // 添加用户表
  users: defineTable({
    userId: v.string(),
    email: v.string(),
    role: v.union(v.literal('teacher'), v.literal('student')),
    name: v.string(),
    createdAt: v.number(),
  }).index('by_userId', ['userId']),

  // 已有的 classrooms 表
  classrooms: defineTable({
    code: v.string(),
    name: v.optional(v.string()),
    description: v.optional(v.string()),      // 新增 ✨
    teacherId: v.string(),
    teacherName: v.optional(v.string()),      // 新增 ✨
    createdAt: v.number(),
    students: v.array(
      v.object({
        studentId: v.string(),
        joinedAt: v.number(),
        status: v.string(),
      })
    ),
  })
    .index('by_code', ['code'])
    .searchIndex('by_student', {
      searchField: 'students',
      filterFields: ['students'],
    }),

  // tasks 表
  tasks: defineTable({
    title: v.string(),
    description: v.string(),
    classroomId: v.id('classrooms'),
    teacherId: v.string(),
    dueDate: v.optional(v.number()),
    createdAt: v.number(),
    status: v.string(),
    attachments: v.optional(
      v.array(
        v.object({
          name: v.string(),
          url: v.string(),
          size: v.number(),
        })
      )
    ),
    // 旧字段（单个文件）- 保留兼容
    storageId: v.optional(v.id('_storage')),
    attachmentName: v.optional(v.string()),
    attachmentUrl: v.optional(v.string()),
    // 新字段（多文件）- 数组
    storageIds: v.optional(v.array(v.id('_storage'))),
    attachmentNames: v.optional(v.array(v.string())),
    attachmentUrls: v.optional(v.array(v.string())),
  })
    .index('by_classroom', ['classroomId'])
    .index('by_teacher', ['teacherId']),

  // 已有的 taskSubmissions 表
  taskSubmissions: defineTable({
    taskId: v.id('tasks'),
    studentId: v.string(),
    content: v.string(),
    submittedAt: v.number(),
    status: v.string(), // "submitted" | "graded"
    grade: v.optional(v.number()),
    feedback: v.optional(v.string()),
    gradedAt: v.optional(v.number()),
    gradedBy: v.optional(v.string()),
    attachmentUrl: v.optional(v.string()),
    attachmentName: v.optional(v.string()),
    storageId: v.optional(v.id('_storage')),
  })
    .index('by_task_student', ['taskId', 'studentId'])
    .index('by_task', ['taskId'])
    .index('by_student', ['studentId']),

  // 教师表 ✨ 新增
  teachers: defineTable({
    teacherId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    bio: v.string(),
    city: v.string(),
    country: v.string(),
    specialization: v.string(),
    teachingPhilosophy: v.string(),
    avatar: v.optional(v.string()),
  }).index("by_teacherId", ["teacherId"]),

  // 学生个人资料表
  studentProfiles: defineTable({
    studentId: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    bio: v.optional(v.string()),
    city: v.optional(v.string()),
    country: v.optional(v.string()),
    major: v.optional(v.string()),
    goal: v.optional(v.string()),
    avatar: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_student_id', ['studentId']),

  // 教师课程表
  teacherSchedules: defineTable({
    teacherId: v.string(),      // Clerk user ID
    courseName: v.string(),     // 课程名称，如 "ACG100"
    dayOfWeek: v.number(),      // 0-6 (Sunday-Saturday)
    startTime: v.string(),      // HH:MM 格式，如 "17:30"
    endTime: v.string(),        // HH:MM 格式，如 "18:00"
    color: v.string(),          // 颜色代码，如 "#8b5cf6"
    createdAt: v.number(),      // 创建时间戳
  })
    .index('by_teacher', ['teacherId'])
    .index('by_teacher_and_day', ['teacherId', 'dayOfWeek']),

  // 学生提交表
  submissions: defineTable({
    taskId: v.id('tasks'),
    studentId: v.string(),
    submissionText: v.string(),
    submissionFiles: v.optional(
      v.array(
        v.object({
          name: v.string(),
          storageId: v.string(),     // ✅ 改为 storageId
          size: v.number(),
        })
      )
    ),
    submittedAt: v.number(),
    status: v.union(
      v.literal('submitted'),
      v.literal('graded'),
      v.literal('late')
    ),
    grade: v.optional(v.number()),
    feedback: v.optional(v.string()),
    gradedAt: v.optional(v.number()),
    gradedBy: v.optional(v.string()),
  })
    .index('by_task', ['taskId'])
    .index('by_student', ['studentId'])
    .index('by_task_and_student', ['taskId', 'studentId']),
});