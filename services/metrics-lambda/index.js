export async function handler(event) {
  const notes = Array.isArray(event?.notes) ? event.notes : [];
  const statuses = ['Pendiente','En curso','Hecho'];
  return { statusCode:200, headers:{'content-type':'application/json'}, body:JSON.stringify({total:notes.length,byStatus:Object.fromEntries(statuses.map(s=>[s,notes.filter(n=>n.status===s).length]))}) };
}
