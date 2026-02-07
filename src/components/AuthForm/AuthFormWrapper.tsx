import styles from './AuthFormWrapper.module.css';

export default function AuthFormWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.wrapper}>
        {children}
      </div>
    </div>
  );
}