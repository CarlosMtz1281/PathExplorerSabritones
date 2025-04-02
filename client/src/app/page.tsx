"use client";

import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-base-300 text-base-content">
      <div className="w-full max-w-3xl text-center p-10 shadow-xl bg-base-100">
        <div>
          <h1 className="text-5xl font-bold text-primary">PathExplorer</h1>
          <p className="mt-4 text-lg text-secondary">
            Explore new career paths with Accenture x Sabritones.
          </p>
          <div className="mt-6 flex gap-4 justify-center">
            <button className="btn btn-active btn-primary" onClick={() => router.push("/login")}>
              Login
            </button>
            <button className="btn btn-outline btn-primary" onClick={() => router.push("/sign-up")}            >
              Sign Up
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
