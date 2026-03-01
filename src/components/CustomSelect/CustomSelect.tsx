import { useState, useRef, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./CustomSelect.module.css";

export interface SelectOption {
  value: string;
  label: string;
  color?: string;
  background?: string;
  icon?: ReactNode;
}

interface Props {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}

const CustomSelect = ({ value, options, onChange }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <>
      <div
        ref={triggerRef}
        className={styles.trigger}
        style={{
          background: selected?.background,
          color: selected?.color,
        }}
        onClick={toggle}
      >
        <span className={styles.labelContent}>
          {selected?.icon}
          {selected?.label}
        </span>
        <span className={`${styles.arrow} ${isOpen ? styles.open : ""}`}>
          ▼
        </span>
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            className={styles.dropdown}
            style={{
              top: position.top,
              left: position.left,
              minWidth: position.width,
            }}
          >
            {options.map((option) => (
              <div
                key={option.value}
                className={styles.option}
                style={{
                  color: option.value === value ? option.color : "inherit",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.icon}
                {option.label}
              </div>
            ))}
          </div>,
          document.body
        )}
    </>
  );
};

export default CustomSelect;