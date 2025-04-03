import React from 'react';
import Navbar from '../../components/nav/Navbar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="relative">
            {/* Navbar with absolute positioning */}
            <div className="fixed top-0 left-0 h-full z-50">
                <Navbar />
            </div>
            {/* Main content */}
            <main className="ml-0 ml-15">{children}</main>
        </div>
    );
};

export default Layout;