import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const setUserRole = mutation({
  args: {
    userId: v.string(),
    email: v.string(),
    role: v.union(v.literal('teacher'), v.literal('student')),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // 检查用户是否已存在
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_userId')
      .filter((q) => q.eq(q.field('userId'), args.userId))
      .first();

    if (existingUser) {
      throw new Error('User already exists');
    }

    // 创建新用户
    await ctx.db.insert('users', {
      userId: args.userId,
      email: args.email,
      role: args.role,
      name: args.name,
      createdAt: Date.now(),
    });
  },
});

export const getUserRole = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_userId')
      .filter((q) => q.eq(q.field('userId'), args.userId))
      .first();

    return user;
  },
});
