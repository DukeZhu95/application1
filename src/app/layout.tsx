import { ClerkProvider } from '@clerk/nextjs';
import { ConvexClientProvider } from '@/providers/convex-client-provider';
import './globals.css';
import React from 'react';
import '@/styles/index.css';
// ⭐ 导入 Clerk 自定义配置
import { clerkAppearance, clerkLayout } from '@/config/clerk-appearance';

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
    <body>
    {/* ⭐ 添加 appearance 和布局配置 */}
    <ClerkProvider
      appearance={clerkAppearance}
      {...clerkLayout}
    >
      <main className="container">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </main>
    </ClerkProvider>
    </body>
    </html>
  );
}