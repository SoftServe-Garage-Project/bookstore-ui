import styles from './Button.module.css';
import React from 'react';

export default function Button({ children, className, ...rest }: React.ComponentProps<'button'>) {
  return (
    <button
      className={`${styles.button} ${className || ''}`} 
      {...rest}
    >
      {children}
    </button>
  );
}