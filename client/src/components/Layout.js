import React from 'react';
import MainNavigation from './MainNavigation';
import PropTypes from "prop-types";

const Layout = ({ children }) => {
    return (
        <div>
            <MainNavigation />
            <main>
                {children}
            </main>
        </div>
    );
};

Layout.propTypes = {
    children: PropTypes.node.isRequired, // Validates that children is a node and is required
};

export default Layout;
