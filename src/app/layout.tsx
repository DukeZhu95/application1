import {
    ClerkProvider,
    SignInButton,
    SignedIn,
    SignedOut,
    UserButton
} from '@clerk/nextjs'
import './globals.css'
import React from "react";

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <ClerkProvider>
            <html lang="en">
            <body>
            <nav className="fixed top-0 w-full bg-white shadow-sm">
                <div className="container mx-auto flex h-16 items-center px-4 justify-between">
                    <h1 className="text-xl font-bold">Classroom Manager</h1>
                    <UserButton afterSignOutUrl="/" />
                </div>
            </nav>
            <main className="pt-16">
                {children}
            </main>
            </body>
            </html>
        </ClerkProvider>
    );
}