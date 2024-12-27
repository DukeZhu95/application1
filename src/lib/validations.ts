import * as z from 'zod';

export const classCodeSchema = z.object({
  code: z
    .string()
    .length(6, 'Class code must be exactly 6 characters')
    .regex(/^[A-Z0-9]+$/, 'Only uppercase letters and numbers are allowed')
    .refine((code) => {
      // 检查是否包含至少一个数字和一个字母
      const hasLetter = /[A-Z]/.test(code);
      const hasNumber = /[0-9]/.test(code);
      return hasLetter && hasNumber;
    }, 'Must contain both letters and numbers'),
});

// 添加生成班级代码的工具函数
export function generateClassCode(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  let code = '';

  // 确保至少有一个字母
  code += letters.charAt(Math.floor(Math.random() * letters.length));
  // 确保至少有一个数字
  code += numbers.charAt(Math.floor(Math.random() * numbers.length));

  // 填充剩余字符
  const chars = letters + numbers;
  for (let i = code.length; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // 打乱字符顺序
  return code
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

export const userIdSchema = z.object({
  alphanumericId: z
    .string()
    .length(6, 'ID must be exactly 6 characters')
    .regex(/^[A-Z0-9]+$/, 'Only uppercase letters and numbers are allowed')
    .refine((id) => {
      // 确保包含至少一个字母和一个数字
      const hasLetter = /[A-Z]/.test(id);
      const hasNumber = /[0-9]/.test(id);
      return hasLetter && hasNumber;
    }, 'Must contain both letters and numbers'),
});
