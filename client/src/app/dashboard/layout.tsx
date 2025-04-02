import React from 'react';
import Navbar from '../../components/nav/Navbar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex">
            <Navbar />
            <main className="flex-grow">{children}</main>
        </div>
    );
};

export default Layout;