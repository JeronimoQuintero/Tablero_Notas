export const NOTE_STATUSES = Object.freeze(['Pendiente', 'En curso', 'Hecho']);
export const createNote = ({ title = '', text = '', status = 'Pendiente', x = 80, y = 80 }) => ({ id: crypto.randomUUID(), title: title.trim(), text: text.trim(), status, x: Math.max(0, Math.round(x)), y: Math.max(0, Math.round(y)) });
