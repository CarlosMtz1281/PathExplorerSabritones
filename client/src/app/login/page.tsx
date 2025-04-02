"use client";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-base-300 text-base-content">
      <div className="w-full max-w-md p-8 shadow-xl bg-base-100 rounded-lg">
        <h2 className="text-3xl font-bold text-primary text-center">Login</h2>
        <form className="mt-6 flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="input input-bordered w-full"
          />
          <input
            type="password"
            placeholder="Password"
            className="input input-bordered w-full"
          />
          <button className="btn btn-active btn-primary w-full">Login</button>
        </form>
        <p className="mt-4 text-center text-secondary">
          Don't have an account? <a href="/signup" className="text-primary">Sign up</a>
        </p>
      </div>
    </div>
  );
}
