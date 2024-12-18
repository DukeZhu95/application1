import { clerkMiddleware } from "@clerk/nextjs/server";

// @ts-ignore
export default clerkMiddleware({
    // 只允许这些路由公开访问
    publicRoutes: ["/"],
    // 这些路由即使未登录也可以访问
    ignoredRoutes: [
        "/auth/sign-in",
        "/auth/sign-up",
    ],
});

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};