import { ClipboardList } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="empty-state">
      <ClipboardList className="empty-state__icon" size={40} />
      <h3>No items yet</h3>
      <p>Share text or upload a file to get started.</p>
    </div>
  );
}
