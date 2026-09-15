import { handler } from './index.js';
console.log((await handler({notes:[{status:'Pendiente'},{status:'Hecho'}]})).body);
