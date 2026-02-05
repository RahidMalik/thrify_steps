import { createContext, useState, useContext, useEffect } from 'react';

// 1. Initialize Context
const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    // 2. Logic: Initialize state from localStorage (so it remembers after refresh)
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('thrifty-theme');
        return savedTheme === 'dark';
    });

    // 3. The "Magic" Effect: This applies the '.dark' class to the <html> tag
    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
            localStorage.setItem('thrifty-theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('thrifty-theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode((prev) => !prev);
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            <div className={isDarkMode ? 'dark' : 'light'}>
                {children}
            </div>
        </ThemeContext.Provider>
    );
};

// 5. Custom Hook
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};