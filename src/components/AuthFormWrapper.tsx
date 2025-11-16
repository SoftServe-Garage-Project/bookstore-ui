export default function AuthFormWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "100px auto",
        padding: "30px",
        border: "1px solid #ddd",
        borderRadius: "12px",
        boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
      }}
    >
      {children}
    </div>
  );
}
