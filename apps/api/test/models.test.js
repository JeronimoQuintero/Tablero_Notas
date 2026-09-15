import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNote, NOTE_STATUSES } from '../src/models/note.model.js';
import { createUser, publicUser, USER_ROLES } from '../src/models/user.model.js';

test('createNote normaliza título, texto y posición', () => {
  const note = createNote({ title: '  Hola  ', text: '  Mundo  ', x: -4, y: 12.8 });
  assert.equal(note.title, 'Hola');
  assert.equal(note.text, 'Mundo');
  assert.equal(note.x, 0);
  assert.equal(note.y, 13);
  assert.ok(NOTE_STATUSES.includes(note.status));
});

test('createNote usa valores por defecto', () => {
  const note = createNote({});
  assert.equal(note.title, '');
  assert.equal(note.status, 'Pendiente');
  assert.equal(note.x, 80);
});

test('publicUser no expone la contraseña', () => {
  const user = publicUser({ id: '1', name: 'A', email: 'a@b.c', password: 'secret', role: 'USER', active: true });
  assert.equal(user.password, undefined);
  assert.equal(user.email, 'a@b.c');
});

test('createUser normaliza el correo y define el rol', () => {
  const user = createUser({ name: '  Ana  ', email: '  ANA@Demo.Local ', password: 'x', role: 'ADMIN' });
  assert.equal(user.name, 'Ana');
  assert.equal(user.email, 'ana@demo.local');
  assert.equal(user.role, USER_ROLES.ADMIN);
  assert.equal(user.active, true);
});