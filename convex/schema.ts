import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  classrooms: defineTable({
    code: v.string(),
    teacherId: v.string(),
    name: v.optional(v.string()),
    createdAt: v.number(),
    students: v.array(
      v.object({
        studentId: v.string(),
        joinedAt: v.number(),
        status: v.string(), // "active" | "inactive"
      })
    ),
  })
    .index('by_code', ['code'])
    .searchIndex('by_student', {
      searchField: 'students',
      filterFields: ['students'],
    }),

  // 添加新的 tasks 表
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

  taskSubmissions: defineTable({
    taskId: v.id('tasks'),
    studentId: v.string(),
    content: v.string(),
    submittedAt: v.number(),
    status: v.string(), // "submitted" | "graded"
    grade: v.optional(v.number()), // 成绩（可选）
    feedback: v.optional(v.string()), // 教师反馈（可选）
    gradedAt: v.optional(v.number()), // 评分时间（可选）
    gradedBy: v.optional(v.string()), // 评分教师ID（可选）
  })
    .index('by_task_student', ['taskId', 'studentId'])
    .index('by_task', ['taskId'])
    .index('by_student', ['studentId']),
});
