import { Link } from 'react-router-dom';
import React from 'react';

const MainNavigation = () => {
    return (
        <nav className='main-menu'>
            <ul className='menu'>
                <li>
                    <Link to='/' className='menu-link'>Home</Link>
                </li>
                <li>
                    <Link to='/signin' className='menu-link'>Sign In</Link>
                </li>
                <li>
                    <Link to='/signup' className='menu-link'>Sign Up</Link>
                </li>
            </ul>
        </nav>
    );
};

export default MainNavigation;

