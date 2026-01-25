import React, { useEffect } from "react";
import styles from "./StatusModal.module.css";
import Button from "../Button/Button";

export type ModalType = "success" | "error";

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ModalType;
  title: string;
  message: React.ReactNode;
  buttonText?: string;
}

export const StatusModal: React.FC<StatusModalProps> = ({
  isOpen,
  onClose,
  type,
  title,
  message,
  buttonText = "Ок",
}) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isSuccess = type === "success";

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div
          className={`${styles.modalIcon} ${isSuccess ? styles.success : styles.error}`}
        >
          {isSuccess ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="11"
                fill="#10B981"
                stroke="#10B981"
                strokeWidth="2"
              />
              <path
                d="M16.5 8.5L10.5 15.5L7.5 12.5"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="11"
                fill="#EF4444"
                stroke="#EF4444"
                strokeWidth="2"
              />
              <path
                d="M12 8V12M12 16H12.01"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>

        <h3 className={styles.modalTitle}>{title}</h3>
        <div className={styles.modalBody}>{message}</div>
        <Button
          variant={isSuccess ? "success" : "error"}
          className="danger"
          onClick={onClose}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};
