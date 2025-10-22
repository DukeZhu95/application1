import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/**
 * 获取教师资料
 * 根据 teacherId 查询教师的完整资料信息
 */
export const getTeacherProfile = query({
  args: {
    teacherId: v.string()
  },
  handler: async (ctx, args) => {
    // 从 teachers 表中查询教师资料
    const teacher = await ctx.db
      .query("teachers")
      .filter((q) => q.eq(q.field("teacherId"), args.teacherId))
      .first();

    return teacher;
  },
});

/**
 * 更新教师资料
 * 如果教师资料存在则更新，不存在则创建新记录
 */
export const updateTeacherProfile = mutation({
  args: {
    teacherId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    bio: v.optional(v.string()),
    city: v.string(),
    country: v.string(),
    specialization: v.optional(v.string()),
    teachingPhilosophy: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 查找现有的教师记录
    const existingTeacher = await ctx.db
      .query("teachers")
      .filter((q) => q.eq(q.field("teacherId"), args.teacherId))
      .first();

    if (existingTeacher) {
      // 更新现有记录
      await ctx.db.patch(existingTeacher._id, {
        firstName: args.firstName,
        lastName: args.lastName,
        bio: args.bio || "",
        city: args.city,
        country: args.country,
        specialization: args.specialization || "",
        teachingPhilosophy: args.teachingPhilosophy || "",
        avatar: args.avatar,
      });
    } else {
      // 创建新记录
      await ctx.db.insert("teachers", {
        teacherId: args.teacherId,
        firstName: args.firstName,
        lastName: args.lastName,
        bio: args.bio || "",
        city: args.city,
        country: args.country,
        specialization: args.specialization || "",
        teachingPhilosophy: args.teachingPhilosophy || "",
        avatar: args.avatar,
      });
    }

    return { success: true };
  },
});

/**
 * 获取所有教师列表（可选功能）
 * 用于管理员查看所有教师
 */
export const getAllTeachers = query({
  handler: async (ctx) => {
    const teachers = await ctx.db.query("teachers").collect();
    return teachers;
  },
});

/**
 * 删除教师资料（可选功能）
 * 用于删除教师账号时清理资料
 */
export const deleteTeacherProfile = mutation({
  args: {
    teacherId: v.string(),
  },
  handler: async (ctx, args) => {
    const teacher = await ctx.db
      .query("teachers")
      .filter((q) => q.eq(q.field("teacherId"), args.teacherId))
      .first();

    if (teacher) {
      await ctx.db.delete(teacher._id);
      return { success: true };
    }

    return { success: false, message: "Teacher not found" };
  },
});