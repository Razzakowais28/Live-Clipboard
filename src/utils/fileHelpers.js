export function sanitizeFileName(name) {
  const base = name.replace(/[^a-zA-Z0-9._-]/g, '_');
  return base || 'file';
}

export function buildStoragePath(roomCode, fileName) {
  const safe = sanitizeFileName(fileName);
  return `${roomCode}/${Date.now()}-${safe}`;
}

export async function copyToClipboard(text) {
  await navigator.clipboard.writeText(text);
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
