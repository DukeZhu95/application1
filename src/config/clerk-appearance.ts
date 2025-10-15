// Clerk 外观自定义配置
// 使用玻璃态设计风格，与角色选择页面保持一致

import { Theme } from "@clerk/types";

export const clerkAppearance: Theme = {
  baseTheme: undefined, // 不使用预设主题,完全自定义
  variables: {
    // 颜色变量
    colorPrimary: "#667eea", // 主色调 - 紫色
    colorDanger: "#f5576c", // 错误/危险色
    colorSuccess: "#10b981", // 成功色
    colorWarning: "#f59e0b", // 警告色
    colorTextOnPrimaryBackground: "#ffffff", // 主背景上的文字颜色
    colorTextSecondary: "#64748b", // 次要文字颜色

    // 字体
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontFamilyButtons: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

    // 圆角 - 增加圆角大小
    borderRadius: "16px", // 统一圆角

    // 间距
    spacingUnit: "1rem",
  },
  elements: {
    // 根容器
    rootBox: {
      width: "100%",
      maxWidth: "440px",
      overflow: "hidden", // 🔥 确保圆角不被子元素破坏
    },

    // 卡片容器 - 玻璃态效果 + 圆角
    card: {
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.3)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      borderRadius: "24px", // 🔥 主卡片圆角
      padding: "2.5rem",
      overflow: "hidden", // 🔥 确保内容不会破坏圆角
    },

    // 标题
    headerTitle: {
      fontSize: "1.875rem",
      fontWeight: "700",
      color: "#1a202c",
      textAlign: "center",
      marginBottom: "0.5rem",
    },

    // 副标题
    headerSubtitle: {
      fontSize: "1rem",
      color: "#64748b",
      textAlign: "center",
      fontWeight: "400",
    },

    // 社交登录按钮容器
    socialButtonsBlockButton: {
      background: "white",
      border: "1.5px solid #e2e8f0",
      borderRadius: "12px", // 圆角按钮
      padding: "0.875rem 1.25rem",
      fontSize: "0.9375rem",
      fontWeight: "500",
      color: "#1a202c",
      transition: "all 0.3s ease",
      "&:hover": {
        background: "#f8fafc",
        borderColor: "#cbd5e1",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
      },
      "&:focus": {
        borderColor: "#667eea",
        boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
      },
    },

    // 社交按钮图标
    socialButtonsBlockButtonIcon: {
      width: "20px",
      height: "20px",
    },

    // 分割线
    dividerLine: {
      background: "#e2e8f0",
      height: "1px",
    },

    dividerText: {
      color: "#64748b",
      fontSize: "0.875rem",
      fontWeight: "500",
      padding: "0 1rem",
    },

    // 表单容器
    form: {
      gap: "1.25rem",
    },

    // 表单字段容器
    formFieldRow: {
      gap: "0.5rem",
    },

    // 表单字段标签
    formFieldLabel: {
      fontSize: "0.9375rem",
      fontWeight: "500",
      color: "#1a202c",
      marginBottom: "0.5rem",
    },

    // 输入框 - 圆角
    formFieldInput: {
      background: "white",
      border: "1.5px solid #e2e8f0",
      borderRadius: "12px", // 🔥 输入框圆角
      padding: "0.875rem 1rem",
      fontSize: "0.9375rem",
      color: "#1a202c",
      transition: "all 0.3s ease",
      "&:hover": {
        borderColor: "#cbd5e1",
      },
      "&:focus": {
        borderColor: "#667eea",
        boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
        outline: "none",
      },
      "&::placeholder": {
        color: "#94a3b8",
      },
    },

    // 主按钮（Continue/Sign in）- 圆角
    formButtonPrimary: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      border: "none",
      borderRadius: "12px", // 🔥 按钮圆角
      padding: "0.875rem 1.5rem",
      fontSize: "1rem",
      fontWeight: "600",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: "0 10px 30px rgba(102, 126, 234, 0.3)",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 15px 40px rgba(102, 126, 234, 0.4)",
      },
      "&:active": {
        transform: "translateY(0)",
      },
      "&:focus": {
        boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.3)",
      },
    },

    // 底部链接（Don't have an account? / Already have an account?）
    footerActionLink: {
      color: "#667eea",
      fontWeight: "600",
      textDecoration: "none",
      transition: "color 0.2s ease",
      "&:hover": {
        color: "#764ba2",
        textDecoration: "underline",
      },
    },

    footerActionText: {
      color: "#64748b",
      fontSize: "0.9375rem",
    },

    // 错误信息
    formFieldErrorText: {
      color: "#f5576c",
      fontSize: "0.875rem",
      marginTop: "0.375rem",
    },

    // 身份验证图标
    identityPreviewEditButton: {
      color: "#667eea",
      "&:hover": {
        color: "#764ba2",
      },
    },

    // 加载状态
    spinner: {
      color: "#667eea",
    },

    // 返回按钮
    backButton: {
      color: "#667eea",
      fontWeight: "500",
      "&:hover": {
        color: "#764ba2",
      },
    },

    // 🔥 Footer (Secured by Clerk) - 白色背景 + 底部圆角
    footer: {
      background: "rgba(255, 255, 255, 0.95)", // 白色背景
      backdropFilter: "blur(20px)", // 模糊效果
      WebkitBackdropFilter: "blur(20px)", // Safari 支持
      borderTop: "1px solid rgba(226, 232, 240, 0.8)", // 分割线
      padding: "1.5rem", // 内边距
      borderRadius: "0 0 24px 24px", // 🔥 底部圆角（重要！）
      marginTop: "1.5rem",
      marginLeft: "-2.5rem", // 🔥 负边距，让 footer 延伸到卡片边缘
      marginRight: "-2.5rem", // 🔥 负边距，让 footer 延伸到卡片边缘
      marginBottom: "-2.5rem", // 🔥 负边距，让 footer 延伸到卡片底部
      paddingLeft: "2.5rem", // 🔥 补偿负边距，保持内容居中
      paddingRight: "2.5rem", // 🔥 补偿负边距，保持内容居中
      paddingBottom: "2rem", // 🔥 底部额外间距
      boxShadow: "none", // 无阴影
      "& a": {
        color: "#667eea",
        fontWeight: "500",
        "&:hover": {
          color: "#764ba2",
        },
      },
    },

    // 🔥 Footer Action - 确保背景透明
    footerAction: {
      background: "transparent",
    },

    // OTP (One-Time Password) 输入框
    formFieldInputShowPasswordButton: {
      color: "#64748b",
      "&:hover": {
        color: "#1a202c",
      },
    },

    // 警告/提示框
    alertText: {
      fontSize: "0.875rem",
      color: "#64748b",
    },

    // Badge (如 "Recommended") - 圆角
    badge: {
      background: "rgba(102, 126, 234, 0.1)",
      color: "#667eea",
      fontSize: "0.75rem",
      fontWeight: "600",
      padding: "0.25rem 0.625rem",
      borderRadius: "6px", // 🔥 Badge 圆角
    },
  },
};

// 布局配置
export const clerkLayout = {
  logoPlacement: "inside" as const, // Logo 放在卡片内部
  socialButtonsPlacement: "top" as const, // 社交登录按钮在顶部
  socialButtonsVariant: "blockButton" as const, // 块状按钮
  showOptionalFields: true, // 显示可选字段
};