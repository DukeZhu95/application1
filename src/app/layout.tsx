import { ClerkProvider } from '@clerk/nextjs';
import { ConvexClientProvider } from '@/providers/convex-client-provider';
import './globals.css';
import React from 'react';
import '@/styles/index.css';
import { clerkAppearance, clerkLayout } from '@/config/clerk-appearance';

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
    <body>
    <ClerkProvider
      appearance={clerkAppearance}
      {...clerkLayout}
    >
      <ConvexClientProvider>{children}</ConvexClientProvider>
    </ClerkProvider>
    </body>
    </html>
  );
}