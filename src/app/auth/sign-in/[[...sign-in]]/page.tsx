"use client";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <SignIn
                path="/auth/sign-in"
                routing="path"
                signUpUrl="/auth/sign-up"
                redirectUrl="/dashboard"
                afterSignInUrl="/dashboard"
            />
        </div>
    );
}