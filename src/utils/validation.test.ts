import { validateRegistration, RegisterFormFields } from './validation';

describe('validateRegistration', () => {
    it('Повинен повертати null для валідних даних реєстрації', () => {
        const validFields: RegisterFormFields = {
            name: 'Ivan',
            email: 'test@example.com',
            password: 'password123',
            passwordConfirm: 'password123'
        };
        expect(validateRegistration(validFields)).toBeNull();
    });

    it('Повинен повертати "Name is required" якщо ім\'я порожнє', () => {
        const fields: RegisterFormFields = {
            name: '   ',
            email: 'test@example.com',
            password: 'password123',
            passwordConfirm: 'password123'
        };
        expect(validateRegistration(fields)).toBe('Name is required');
    });

    it('Повинен повертати "Invalid email" якщо email не містить @', () => {
        const fields: RegisterFormFields = {
            name: 'Ivan',
            email: 'test-example.com',
            password: 'password123',
            passwordConfirm: 'password123'
        };
        expect(validateRegistration(fields)).toBe('Invalid email');
    });

    it('Повинен повертати "Password must be at least 8 characters" якщо пароль менше 8 символів', () => {
        const fields: RegisterFormFields = {
            name: 'Ivan',
            email: 'test@example.com',
            password: 'short',
            passwordConfirm: 'short'
        };
        expect(validateRegistration(fields)).toBe('Password must be at least 8 characters');
    });

    it('Повинен повертати "Passwords do not match" якщо паролі не співпадають', () => {
        const fields: RegisterFormFields = {
            name: 'Ivan',
            email: 'test@example.com',
            password: 'password123',
            passwordConfirm: 'different123'
        };
        expect(validateRegistration(fields)).toBe('Passwords do not match');
    });
});