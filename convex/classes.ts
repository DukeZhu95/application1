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

// 学生加入班级
export const joinClass = mutation({
    args: {
        code: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("You must be logged in to join a class");

        // 查找班级
        const classroom = await ctx.db
            .query("classrooms")
            .withIndex("by_code", q => q.eq("code", args.code))
            .first();

        if (!classroom) {
            throw new Error("Invalid class code");
        }

        // 检查是否已经在班级中
        const isAlreadyJoined = classroom.students.some(
            student => student.studentId === identity.subject
        );

        if (isAlreadyJoined) {
            throw new Error("You are already in this class");
        }

        // 添加学生到班级
        return await ctx.db.patch(classroom._id, {
            students: [
                ...classroom.students,
                {
                    studentId: identity.subject,
                    joinedAt: Date.now(),
                    status: "active",
                }
            ],
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

// 获取学生加入的班级列表
export const getStudentClasses = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("You must be logged in to view classes");

        return await ctx.db
            .query("classrooms")
            .withSearchIndex("by_student", (q) =>
                q.search("students", identity.subject)
            )
            .collect();
    },
});