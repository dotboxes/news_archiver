'use client';

import { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from 'next-themes';

interface DarkModeContextType {
    darkMode: boolean;
    toggleDarkMode: () => void;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export const DarkModeProvider = ({ children }: { children: ReactNode }) => {
    return (
        <ThemeProvider attribute="class" enableSystem={true} defaultTheme="dark">
            <InnerProvider>{children}</InnerProvider>
        </ThemeProvider>
    );
};

// InnerProvider wraps next-themes to provide boolean toggle + mounted check
const InnerProvider = ({ children }: { children: ReactNode }) => {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const darkMode = resolvedTheme === 'dark';
    const toggleDarkMode = () => setTheme(darkMode ? 'light' : 'dark');

    if (!mounted) return null; // Prevent SSR/client mismatch

    return (
        <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
            {children}
        </DarkModeContext.Provider>
    );
};

export const useDarkMode = () => {
    const context = useContext(DarkModeContext);
    if (!context) throw new Error('useDarkMode must be used within DarkModeProvider');
    return context;
};
