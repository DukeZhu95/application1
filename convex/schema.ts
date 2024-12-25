// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    classrooms: defineTable({
        code: v.string(),
        teacherId: v.string(),
        name: v.optional(v.string()),
        createdAt: v.number(),
        students: v.array(v.object({
            studentId: v.string(),
            joinedAt: v.number(),
            status: v.string(), // "active" | "inactive"
        })),
    })
        .index("by_code", ["code"])
        .searchIndex("by_student", {
            searchField: "students",
            filterFields: ["students"]
        }),

    // 添加新的 tasks 表
    tasks: defineTable({
        title: v.string(),
        description: v.string(),
        classroomId: v.id("classrooms"),
        teacherId: v.string(),
        dueDate: v.optional(v.number()),
        createdAt: v.number(),
        status: v.string(), // 'active' | 'archived'
    })
        .index("by_classroom", ["classroomId"])
        .index("by_teacher", ["teacherId"])
});