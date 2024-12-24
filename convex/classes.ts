import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// 创建新班级
export const createClass = mutation({
    args: {
        code: v.string(),
        teacherId: v.string(),
        name: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // 检查班级代码是否已存在
        const existingClass = await ctx.db
            .query("classrooms")
            .withIndex("by_code", (q) => q.eq("code", args.code))
            .first();

        if (existingClass) {
            throw new Error("Class code already exists");
        }

        // 创建新班级
        return await ctx.db.insert("classrooms", {
            code: args.code,
            teacherId: args.teacherId,
            name: args.name || `Class ${args.code}`,
            createdAt: Date.now(),
            students: [],
        });
    },
});

// 加入班级
export const joinClass = mutation({
    args: {
        code: v.string(),
        studentId: v.string(),
    },
    handler: async (ctx, args) => {
        // 查找班级
        const classroom = await ctx.db
            .query("classrooms")
            .withIndex("by_code", (q) => q.eq("code", args.code))
            .first();

        if (!classroom) {
            throw new Error("Class not found");
        }

        // 检查学生是否已经在班级中
        if (classroom.students.includes(args.studentId)) {
            throw new Error("Student already in class");
        }

        // 将学生添加到班级
        return await ctx.db.patch(classroom._id, {
            students: [...classroom.students, args.studentId],
        });
    },
});

// 检查班级代码是否存在
export const checkClassExists = query({
    args: { code: v.string() },
    handler: async (ctx, args) => {
        const classroom = await ctx.db
            .query("classrooms")
            .withIndex("by_code", (q) => q.eq("code", args.code))
            .first();
        return !!classroom;
    },
});

// 获取班级信息
export const getClassInfo = query({
    args: { code: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("classrooms")
            .withIndex("by_code", (q) => q.eq("code", args.code))
            .first();
    },
});

// 获取教师的班级列表
export const getTeacherClasses = query({
    args: { teacherId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("classrooms")
            .filter(q => q.eq(q.field("teacherId"), args.teacherId))
            .collect();
    },
});

// 获取学生的班级列表
export const getStudentClasses = query({
    args: { studentId: v.string() },
    handler: async (ctx, args) => {
        // 获取学生加入的所有班级
        return await ctx.db
            .query("classrooms")
            .withSearchIndex("by_student", q =>
                q.search("students", args.studentId)
            )
            .collect();
    },
});