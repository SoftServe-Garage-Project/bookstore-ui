import styles from './Button.module.css';
import React from 'react';

type ButtonProps = React.ComponentProps<'button'> & {
  children: React.ReactNode;
  disabled?: boolean;
};

export default function Button({ children, className, ...rest }: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${className || ''}`} 
      {...rest}
    >
      {children}
    </button>
  );
}