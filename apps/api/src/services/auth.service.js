import bcrypt from 'bcryptjs'; import jwt from 'jsonwebtoken'; import { userRepository } from '../repositories/user.repository.js'; import { publicUser } from '../models/user.model.js';
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET es obligatorio en producción');
const secret = process.env.JWT_SECRET || 'local-development-only';
export async function login(email, password) { const user = await userRepository.findByEmail(email || ''); if (!user || !user.active || !bcrypt.compareSync(password || '', user.password)) { const error = new Error('Correo o contraseña incorrectos'); error.status = 401; throw error; } return { token: jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn: '8h' }), user: publicUser(user) }; }
export const verifyToken = token => jwt.verify(token, secret);
