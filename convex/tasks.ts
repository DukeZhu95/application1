// convex/tasks.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// 创建新任务
export const createTask = mutation({
    args: {
        title: v.string(),
        description: v.string(),
        classroomId: v.id("classrooms"),
        dueDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("You must be logged in to create a task");

        // 验证教师身份
        const classroom = await ctx.db.get(args.classroomId);
        if (!classroom || classroom.teacherId !== identity.subject) {
            throw new Error("You are not authorized to create tasks in this classroom");
        }

        // 创建任务
        return await ctx.db.insert("tasks", {
            ...args,
            teacherId: identity.subject,
            createdAt: Date.now(),
            status: "active",
        });
    },
});

// 获取班级任务列表
export const getClassTasks = query({
    args: {
        classroomId: v.id("classrooms"),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("tasks")
            .withIndex("by_classroom", (q) =>
                q.eq("classroomId", args.classroomId)
            )
            .order("desc")
            .collect();
    },
});