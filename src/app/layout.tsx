import { ClerkProvider } from '@clerk/nextjs';
import { ConvexClientProvider } from '@/providers/convex-client-provider';
import './globals.css';
import React from 'react';
import '@/styles/index.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <main className="container">
            <ConvexClientProvider>{children}</ConvexClientProvider>
          </main>
        </ClerkProvider>
      </body>
    </html>
  );
}
