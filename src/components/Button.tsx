import styles from './Button.module.css';

type ButtonProps = {
  children: React.ReactNode;
  disabled?: boolean;
};

export default function Button({ children, disabled }: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={styles.button}
    >
      {children}
    </button>
  );
}