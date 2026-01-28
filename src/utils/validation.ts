export type RegisterFormFields = {
    name: string;
    email: string;
    password: string;
    passwordConfirm: string;
};

export function validateRegistration(fields: RegisterFormFields): string | null {
    const { name, email, password, passwordConfirm } = fields;

    if (!name.trim()) return "Name is required";
    if (!email.includes("@")) return "Invalid email";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (password !== passwordConfirm) return "Passwords do not match";

    return null;
}