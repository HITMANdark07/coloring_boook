import React from 'react';
import { FiLogOut } from 'react-icons/fi';

const NavBar = ({isLoggedIn, logout}) => {
    return (
        <div className='flex sticky z-20 top-0 bg-black py-2 items-center flex-row justify-between px-4'>
            <div className='text-2xl text-white'>COLORING BOOK</div>
            {isLoggedIn && <div className='text-xs flex flex-row gap-2 items-center cursor-pointer' onClick={logout}>
                <div className='text-sm text-white'>Logout</div>
                <FiLogOut color='#fff' />
            </div>}
        </div>
    )
}

export default NavBar;