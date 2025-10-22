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

  // 已有的 tasks 表
  tasks: defineTable({
    title: v.string(),
    description: v.string(),
    classroomId: v.id('classrooms'),
    teacherId: v.string(),
    dueDate: v.optional(v.number()),
    createdAt: v.number(),
    status: v.string(), // 'active' | 'archived'
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
    storageId: v.optional(v.string()),
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
    studentId: v.string(),          // Clerk 用户 ID
    firstName: v.string(),
    lastName: v.string(),
    bio: v.optional(v.string()),
    city: v.string(),
    country: v.string(),
    major: v.optional(v.string()),
    goal: v.optional(v.string()),
    avatar: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_studentId", ["studentId"]),
});
