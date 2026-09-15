import { prisma } from './prisma.client.js';
export const userRepository = {
  findByEmail: email => prisma.user.findUnique({ where: { email: email.toLowerCase() } }),
  findById: id => prisma.user.findUnique({ where: { id } }),
  list: () => prisma.user.findMany(),
  create: user => prisma.user.create({ data: user }),
  update: user => prisma.user.update({ where: { id: user.id }, data: user }),
  remove: id => prisma.user.delete({ where: { id } })
};
