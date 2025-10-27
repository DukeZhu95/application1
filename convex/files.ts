// convex/files.ts
// 文件上传相关的 Convex 函数

import { mutation, query } from './_generated/server';
import { Id } from './_generated/dataModel';
import { v } from 'convex/values';

/**
 * 生成文件上传 URL
 * 用于学生上传作业附件
 */
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * 获取文件的下载 URL
 * 用于在前端显示和下载文件
 */
export const getFileUrl = query({
  args: {
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    // 将字符串转换为 Id<'_storage'> 类型
    const storageId = args.storageId as Id<'_storage'>;

    // 从 Convex Storage 获取文件 URL
    const url = await ctx.storage.getUrl(storageId);

    return url;
  },
});

/**
 * 删除文件
 * 用于清理不需要的文件（如学生更新提交时删除旧附件）
 */
export const deleteFile = mutation({
  args: {
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const storageId = args.storageId as Id<'_storage'>;
    await ctx.storage.delete(storageId);
    return { success: true };
  },
});

/**
 * 获取文件元数据
 * 返回文件的基本信息（如果需要）
 */
export const getFileMetadata = query({
  args: {
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    const storageId = args.storageId as Id<'_storage'>;

    // Convex Storage 不直接提供元数据查询
    // 这里返回 URL，实际使用时可以根据需要扩展
    const url = await ctx.storage.getUrl(storageId);

    return {
      storageId: args.storageId,
      url,
    };
  },
});