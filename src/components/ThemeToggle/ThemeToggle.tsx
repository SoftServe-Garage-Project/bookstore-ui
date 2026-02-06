import React from 'react';
import styles from './ThemeToggle.module.css';

interface ThemeToggleProps {
  theme: string;
  toggleTheme: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggleTheme }) => {
  return (
    <button 
      className={styles.themeToggle} 
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g className={styles.sunGroup}>
          <circle cx="12" cy="12" r="4" strokeWidth="1.5" />
          <path 
            d="M12 5V3M12 21V19M5 12H3M21 12H19M6.34 6.34L4.93 4.93M17.66 17.66L19.07 19.07M6.34 17.66L4.93 19.07M17.66 6.34L19.07 4.93" 
            strokeWidth="1.5" 
            strokeLinecap="round"
          />
        </g>
        <path 
          className={styles.moonPath} 
          d="M21 12.79C20.84 14.49 20.2 16.11 19.15 17.46C18.1 18.81 16.69 19.84 15.08 20.42C13.47 21 11.73 21.11 10.06 20.74C8.39 20.37 6.86 19.53 5.66 18.33C4.46 17.13 3.62 15.6 3.25 13.93C2.88 12.26 2.99 10.52 3.57 8.91C4.15 7.3 5.18 5.89 6.53 4.84C7.88 3.79 9.5 3.15 11.2 3C10.2 4.35 9.72 6.01 9.85 7.68C9.98 9.35 10.7 10.92 11.89 12.11C13.08 13.3 14.65 14.02 16.32 14.15C17.99 14.28 19.65 13.8 21 12.8" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </svg>
    </button>
  );
};