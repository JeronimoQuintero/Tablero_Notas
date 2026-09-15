import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const users = [
  { name: 'Ana Administradora', email: 'admin@demo.local', password: 'Admin123!', role: 'ADMIN' },
  { name: 'Ulises Usuario', email: 'usuario@demo.local', password: 'User123!', role: 'USER' }
];
const notes = [
  { title: 'Preparar propuesta', text: 'Revisar las prioridades del sprint.', status: 'Pendiente', x: 70, y: 65 },
  { title: 'Diseño del portal', text: 'Validar el flujo de acceso.', status: 'En curso', x: 370, y: 150 },
  { title: 'Kick-off', text: 'Reunión completada.', status: 'Hecho', x: 160, y: 350 }
];

async function main() {
  for (const user of users) {
    await prisma.user.upsert({ where: { email: user.email }, update: { name: user.name, role: user.role, active: true }, create: { ...user, password: await bcrypt.hash(user.password, 10) } });
  }
  if (await prisma.note.count() === 0) await prisma.note.createMany({ data: notes });
}

main().then(() => console.log('Datos demo listos.')).finally(() => prisma.$disconnect());
