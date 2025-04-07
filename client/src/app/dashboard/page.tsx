"use client"; // Required for client-side hooks

import { useSession } from "next-auth/react";

const DashboardPage = () => {
  // Get the session data
  const { data: session, status } = useSession();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to the dashboard, {session?.user?.email}!</p>
      
      {/* Display your session ID to verify it's working */}
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h2 className="font-bold">Session Data:</h2>
        <pre className="text-sm mt-2">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default DashboardPage;