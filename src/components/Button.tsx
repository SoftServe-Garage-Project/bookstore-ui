type ButtonProps = {
  children: React.ReactNode;
  disabled?: boolean;
};

export default function Button({ children, disabled }: ButtonProps) {
  return (
    <button
      disabled={disabled}
      style={{
        padding: "10px",
        width: "100%",
        borderRadius: "6px",
        border: "none",
        background: disabled ? "#bbb" : "#4A6CF7",
        color: "white",
        cursor: disabled ? "not-allowed" : "pointer",
        marginTop: "10px",
        fontSize: "16px",
      }}
    >
      {children}
    </button>
  );
}
