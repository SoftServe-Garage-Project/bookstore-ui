import { useId } from 'react';
import styles from './Input.module.css';

type InputProps = {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
};

export default function Input({ label, type = "text", value, onChange }: InputProps) {
  const inputId = useId();

  return (
    <div className={styles.container}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      
      <input
        id={inputId} 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={styles.input}
      />
    </div>
  );
}