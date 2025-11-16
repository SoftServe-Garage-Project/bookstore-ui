import { use, useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import AuthFormWrapper from "../components/AuthFormWrapper";
export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const validate = () => {
    if (!name.trim()) return "Name is required";
    if (!email.includes("@")) return "Invalid email";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (password !== passwordConfirm) return "Passwords do not match";
    return null;
  };
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: name,
          email: email,
          password: password,
        }),
      });
      if (res.status === 409) {
        throw new Error("Email вже використовується");
      }
      if (!res.ok) {
        throw new Error("Помилка реєстрації");
      }
      setSuccess("Реєстрація успішна! Перенаправлення...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthFormWrapper>
      {" "}
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Реєстрація
      </h2>{" "}
      <form onSubmit={handleRegister}>
        {" "}
        <Input label="Ім'я" value={name} onChange={setName} />{" "}
        <Input label="Email" value={email} onChange={setEmail} type="email" />{" "}
        <Input
          label="Пароль"
          value={password}
          onChange={setPassword}
          type="password"
        />{" "}
        <Input
          label="Підтвердження пароля"
          value={passwordConfirm}
          onChange={setPasswordConfirm}
          type="password"
        />{" "}
        {error && <p style={{ color: "red", marginTop: "10px" }}> {error} </p>}{" "}
        {success && (
          <p style={{ color: "green", marginTop: "10px" }}> {success} </p>
        )}{" "}
        <Button disabled={loading}>
          {" "}
          {loading ? "Завантаження..." : "Зареєструватися"}{" "}
        </Button>{" "}
      </form>{" "}
      <div style={{ marginTop: "15px", textAlign: "center" }}>
        {" "}
        <a href="/login">Вже є акаунт? Увійти</a>{" "}
      </div>{" "}
    </AuthFormWrapper>
  );
}
