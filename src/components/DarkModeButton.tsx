'use client';
import { useDarkMode } from '@/context/DarkModeContext';
import { SunIcon, MoonIcon } from 'lucide-react';

export default function DarkModeButton() {
    const { darkMode, toggleDarkMode } = useDarkMode();

    return (
        <button
            onClick={toggleDarkMode}
            aria-label="Toggle Dark Mode"
            className="p-2 rounded-full bg-tertiary hover:bg-[rgb(var(--border))]
                 shadow-md flex items-center justify-center transition-colors"
        >
            {darkMode ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
        </button>
    );
}
