import { prisma } from './prisma.client.js';
export const noteRepository = {
  list: () => prisma.note.findMany(),
  findById: id => prisma.note.findUnique({ where: { id } }),
  create: note => prisma.note.create({ data: note }),
  update: note => prisma.note.update({ where: { id: note.id }, data: note }),
  remove: id => prisma.note.delete({ where: { id } })
};
