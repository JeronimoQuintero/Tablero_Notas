import { noteRepository } from '../repositories/note.repository.js';
import { handler } from 'metrics-lambda';
export const metrics = async () => { const result = await handler({ notes: await noteRepository.list() }); return JSON.parse(result.body); };