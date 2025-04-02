import React from 'react';
import Navbar from '../../components/nav/Navbar';

const Layout: React.FC = ({ children }) => {
    return (
        <div>
            <Navbar />
            <main>{children}</main>
        </div>
    );
};

export default Layout;