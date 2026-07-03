import { ClipboardList } from 'lucide-react';

const MESSAGES = {
  all: { title: 'Nothing shared yet', text: 'Upload a file or paste an image to get started.' },
  text: { title: 'No text items', text: 'Shared text snippets will appear here.' },
  images: { title: 'No images', text: 'Upload or paste a screenshot to share.' },
  files: { title: 'No files', text: 'Drag and drop files to share them.' },
  links: { title: 'No links', text: 'URLs shared in the room will show up here.' },
};

export default function EmptyState({ tab = 'all' }) {
  const msg = MESSAGES[tab] ?? MESSAGES.all;

  return (
    <div className="empty-state card">
      <ClipboardList className="empty-state__icon" size={36} />
      <h3>{msg.title}</h3>
      <p>{msg.text}</p>
    </div>
  );
}
