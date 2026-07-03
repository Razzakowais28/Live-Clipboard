const URL_PATTERN = /^https?:\/\/.+/i;

export function isLink(text) {
  return URL_PATTERN.test(text?.trim() ?? '');
}

export function getItemCategory(item) {
  if (item.type === 'image') return 'images';
  if (item.type === 'file') return 'files';
  if (item.type === 'text' && isLink(item.content)) return 'links';
  if (item.type === 'text') return 'text';
  return 'all';
}

export function filterItems(items, tab) {
  if (tab === 'all') return items;
  return items.filter((item) => getItemCategory(item) === tab);
}

export function sortWithPinned(items, pinnedIds) {
  const pinned = new Set(pinnedIds);
  return [...items].sort((a, b) => {
    const aPin = pinned.has(a.id) ? 1 : 0;
    const bPin = pinned.has(b.id) ? 1 : 0;
    if (aPin !== bPin) return bPin - aPin;
    return new Date(b.created_at) - new Date(a.created_at);
  });
}

export function loadPinnedIds(roomCode) {
  try {
    const raw = localStorage.getItem(`pinned-${roomCode}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePinnedIds(roomCode, ids) {
  localStorage.setItem(`pinned-${roomCode}`, JSON.stringify(ids));
}

export function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
