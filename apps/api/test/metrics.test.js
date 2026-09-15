import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handler } from 'metrics-lambda';

test('calcula el total y la distribución por estado', async () => {
  const result = await handler({ notes: [{ status: 'Pendiente' }, { status: 'Hecho' }, { status: 'Hecho' }] });
  assert.deepEqual(JSON.parse(result.body), { total: 3, byStatus: { Pendiente: 1, 'En curso': 0, Hecho: 2 } });
});

test('sin notas devuelve total cero', async () => {
  const result = await handler({ notes: [] });
  assert.deepEqual(JSON.parse(result.body), { total: 0, byStatus: { Pendiente: 0, 'En curso': 0, Hecho: 0 } });
});

test('ignora estados desconocidos en el recuento', async () => {
  const result = await handler({ notes: [{ status: 'Pendiente' }, { status: 'Archivada' }, { status: 'En curso' }] });
  assert.deepEqual(JSON.parse(result.body), { total: 3, byStatus: { Pendiente: 1, 'En curso': 1, Hecho: 0 } });
});