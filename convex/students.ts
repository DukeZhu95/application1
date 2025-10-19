import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// 获取学生个人信息
export const getStudentProfile = query({
  args: { studentId: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query('studentProfiles')
      .filter((q) => q.eq(q.field('studentId'), args.studentId))
      .first();

    return profile || {
      studentId: args.studentId,
      firstName: '',
      lastName: '',
      bio: '',
      city: '',
      country: '',
      major: '',
      goal: '',
      avatar: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  },
});

// 更新学生个人信息
export const updateStudentProfile = mutation({
  args: {
    studentId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    bio: v.optional(v.string()),
    city: v.string(),
    country: v.string(),
    major: v.optional(v.string()),
    goal: v.optional(v.string()),
    avatar: v.optional(v.string()), // base64 或 URL
  },
  handler: async (ctx, args) => {
    // 检查是否已有个人资料
    const existingProfile = await ctx.db
      .query('studentProfiles')
      .filter((q) => q.eq(q.field('studentId'), args.studentId))
      .first();

    const profileData = {
      studentId: args.studentId,
      firstName: args.firstName.trim(),
      lastName: args.lastName.trim(),
      bio: args.bio?.trim() || '',
      city: args.city.trim(),
      country: args.country.trim(),
      major: args.major || '',
      goal: args.goal?.trim() || '',
      avatar: args.avatar || undefined,
      updatedAt: Date.now(),
    };

    if (existingProfile) {
      // 更新现有记录
      await ctx.db.patch(existingProfile._id, profileData);
      return await ctx.db.get(existingProfile._id);
    } else {
      // 创建新记录
      const newProfileId = await ctx.db.insert('studentProfiles', {
        ...profileData,
        createdAt: Date.now(),
      });
      return await ctx.db.get(newProfileId);
    }
  },
});

// 获取学生的简要信息（用于显示在其他地方）
export const getStudentBasicInfo = query({
  args: { studentId: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query('studentProfiles')
      .filter((q) => q.eq(q.field('studentId'), args.studentId))
      .first();

    if (!profile) {
      return {
        name: 'Student',
        city: '',
        avatar: null,
      };
    }

    return {
      name: `${profile.firstName} ${profile.lastName}`.trim() || 'Student',
      city: profile.city,
      avatar: profile.avatar,
    };
  },
});