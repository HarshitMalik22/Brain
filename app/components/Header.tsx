"use client";

import { useState } from 'react';

export default function Header(){
    const [activeLink, setActiveLink] = useState('Home');
    return (
        <div className="border-b border-gray-200 py-6 relative">
            <div className="flex items-center px-6">
                <span className="font-bold text-4xl text-black font-sans">Mapy</span>
                <nav className="flex justify-center items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
                    <a 
                        href="#" 
                        className={`font-bold text-2xl cursor-pointer font-sans transition-colors duration-200 ${
                            activeLink === 'Home' 
                                ? 'text-black border-b-4 border-green-400' 
                                : 'text-gray-500 hover:text-black'
                        }`}
                        onClick={(e) => {
                            e.preventDefault();
                            setActiveLink('Home');
                        }}
                    >
                        Home
                    </a>
                    <a 
                        href="#" 
                        className={`font-bold text-2xl cursor-pointer font-sans transition-colors duration-200 ${
                            activeLink === 'Path' 
                                ? 'text-black border-b-4 border-green-400' 
                                : 'text-gray-500 hover:text-black'
                        }`}
                        onClick={(e) => {
                            e.preventDefault();
                            setActiveLink('Path');
                        }}
                    >
                        Path
                    </a>
                    <a 
                        href="#" 
                        className={`font-bold text-2xl cursor-pointer font-sans transition-colors duration-200 ${
                            activeLink === 'Resources' 
                                ? 'text-black border-b-4 border-green-400' 
                                : 'text-gray-500 hover:text-black'
                        }`}
                        onClick={(e) => {
                            e.preventDefault();
                            setActiveLink('Resources');
                        }}
                    >
                        Resources
                    </a>
                </nav>
            </div>
        </div>
    )
}