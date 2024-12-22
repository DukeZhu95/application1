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
        return await ctx.db.insert("classrooms", {
            code: args.code,
            teacherId: args.teacherId,
            name: args.name,
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
        const classroom = await ctx.db
            .query("classrooms")
            .withIndex("by_code", (q) => q.eq("code", args.code))
            .first();

        if (!classroom) {
            throw new Error("Classroom not found");
        }

        return await ctx.db.patch(classroom._id, {
            students: [...classroom.students, args.studentId],
        });
    },
});

// 检查班级是否存在
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