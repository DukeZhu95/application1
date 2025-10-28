// convex/studentProfiles.ts
import { v } from 'convex/values';
import { query, mutation } from './_generated/server';

/**
 * 获取学生资料
 */
export const getStudentProfile = query({
  args: { studentId: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query('studentProfiles')
      .withIndex('by_student_id', (q) => q.eq('studentId', args.studentId))
      .first();

    return profile;
  },
});

/**
 * 创建或更新学生资料
 */
export const upsertStudentProfile = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('studentProfiles')
      .withIndex('by_student_id', (q) => q.eq('studentId', args.studentId))
      .first();

    const now = Date.now();

    if (existing) {
      // 更新现有资料
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: now,
      });
      return existing._id;
    }

    // 创建新资料
    const profileId = await ctx.db.insert('studentProfiles', {
      ...args,
      createdAt: now,
      updatedAt: now,
    });

    return profileId;
  },
});

/**
 * 批量获取学生资料
 */
export const getStudentProfiles = query({
  args: { studentIds: v.array(v.string()) },
  handler: async (ctx, args) => {
    const profiles = await Promise.all(
      args.studentIds.map(async (studentId) => {
        const profile = await ctx.db
          .query('studentProfiles')
          .withIndex('by_student_id', (q) => q.eq('studentId', studentId))
          .first();
        return profile;
      })
    );

    return profiles.filter((p): p is NonNullable<typeof p> => p !== null);
  },
});