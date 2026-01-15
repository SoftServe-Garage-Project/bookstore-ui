import styles from './Button.module.css';
import React from 'react';

export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'outline' 
  | 'danger' 
  | 'ghost' 
  | 'link' 
  | 'nav';

interface ButtonProps extends React.ComponentProps<'button'> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

export default function Button({ 
  children, 
  className, 
  variant = 'primary', 
  fullWidth = false,
  type = 'button',
  onClick,
  ...rest 
}: ButtonProps) {


  const classNames = [
    styles.button,
    styles[variant],
    fullWidth ? styles.fullWidth : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classNames}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}