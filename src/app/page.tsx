import { SignIn } from "@clerk/nextjs";

export default function Home() {
  return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="max-w-5xl w-full">
          <h1 className="text-4xl font-bold text-center mb-8">
            Classroom Task Management System
          </h1>
          <div className="flex justify-center">
            <SignIn />
          </div>
        </div>
      </main>
  );
}