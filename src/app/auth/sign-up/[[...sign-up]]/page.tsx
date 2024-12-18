"use client";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <SignUp
                path="/auth/sign-up"
                routing="path"
                signInUrl="/auth/sign-in"
                redirectUrl="/dashboard"
                afterSignUpUrl="/dashboard"
            />
        </div>
    );
}