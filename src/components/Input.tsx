type InputProps = {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
};

export default function Input({ label, type = "text", value, onChange }: InputProps) {
  return (
    <div style={{ marginBottom: "12px", display: "flex", flexDirection: "column" }}>
      <label style={{ marginBottom: "4px" }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "8px",
          borderRadius: "6px",
          border: "1px solid #aaa",
        }}
      />
    </div>
  );
}
