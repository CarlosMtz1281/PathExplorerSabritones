import React from "react";
import Navbar from "../../components/nav/Navbar";
import ClientOnly from "./ClientOnly";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative">
      {/* Navbar with absolute positioning */}
      <div className="fixed top-0 left-0 h-full z-50">
        <ClientOnly>
          <Navbar />
        </ClientOnly>
      </div>
      {/* Main content */}
      <main className="ml-20">{children}</main>
    </div>
  );
};

export default Layout;
