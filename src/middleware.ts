import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
    // 添加需要公开访问的路由
    publicRoutes: [
        "/",
        "/auth/sign-in",
        "/auth/sign-up"
    ]
});

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"]
};