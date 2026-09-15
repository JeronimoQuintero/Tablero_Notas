export const USER_ROLES = Object.freeze({ ADMIN: 'ADMIN', USER: 'USER' });
export const publicUser = ({ password, ...user }) => user;
export const createUser = ({ name, email, password, role }) => ({ id: crypto.randomUUID(), name: name.trim(), email: email.trim().toLowerCase(), password, role, active: true });
