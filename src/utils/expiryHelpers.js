export const EXPIRY_OPTIONS = [
  { value: 'never', label: 'Never expire', hours: null },
  { value: '1', label: '1 hour', hours: 1 },
  { value: '24', label: '24 hours', hours: 24 },
  { value: '168', label: '7 days', hours: 168 },
];

export function deriveExpiryOption(room) {
  if (!room?.expires_at) return 'never';

  const created = new Date(room.created_at).getTime();
  const expires = new Date(room.expires_at).getTime();
  const durationHours = (expires - created) / (1000 * 60 * 60);

  if (durationHours <= 1.5) return '1';
  if (durationHours <= 25) return '24';
  if (durationHours <= 169) return '168';
  return '24';
}

export function formatExpiryLabel(expiresAt) {
  if (!expiresAt) return 'Never expires';

  const diff = new Date(expiresAt) - Date.now();
  if (diff <= 0) return 'Expired';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Expires in < 1 hour';
  if (hours < 24) return `Expires in ${hours}h`;

  const days = Math.floor(hours / 24);
  return `Expires in ${days}d`;
}

export function computeExpiresAt(option) {
  if (option === 'never') return null;
  return new Date(Date.now() + Number(option) * 60 * 60 * 1000).toISOString();
}

export function getExpiryToastMessage(option) {
  const opt = EXPIRY_OPTIONS.find((o) => o.value === option);
  if (option === 'never') return 'Room set to never expire';
  return `Room expires in ${opt?.label ?? option}`;
}
