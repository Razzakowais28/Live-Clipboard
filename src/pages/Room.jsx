import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Copy, Share2, Send, Check } from 'lucide-react';
import {
  fetchRoom,
  fetchClipboardItems,
  addTextItem,
  uploadFile,
  subscribeToRoom,
} from '../lib/clipboard';
import { copyToClipboard } from '../utils/fileHelpers';
import ClipboardItem from '../components/ClipboardItem';
import FileUpload from '../components/FileUpload';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

function sortItems(items) {
  return [...items].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
}

function upsertItem(items, newItem) {
  const exists = items.some((i) => i.id === newItem.id);
  if (exists) {
    return sortItems(items.map((i) => (i.id === newItem.id ? newItem : i)));
  }
  return sortItems([newItem, ...items]);
}

export default function Room() {
  const { roomCode } = useParams();
  const code = roomCode?.toUpperCase() ?? '';

  const [loading, setLoading] = useState(true);
  const [roomExists, setRoomExists] = useState(false);
  const [items, setItems] = useState([]);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const roomUrl = `${window.location.origin}/room/${code}`;

  const loadRoom = useCallback(async () => {
    setLoading(true);
    setError('');

    const { room, error: roomError } = await fetchRoom(code);
    if (roomError) {
      setError('Failed to load room.');
      setLoading(false);
      return;
    }

    if (!room) {
      setRoomExists(false);
      setLoading(false);
      return;
    }

    setRoomExists(true);

    const { items: fetchedItems, error: itemsError } = await fetchClipboardItems(code);
    if (itemsError) {
      setError('Failed to load clipboard items.');
    } else {
      setItems(sortItems(fetchedItems));
    }

    setLoading(false);
  }, [code]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  useEffect(() => {
    if (!roomExists) return;

    const unsubscribe = subscribeToRoom(code, {
      onInsert: (newItem) => {
        setItems((prev) => upsertItem(prev, newItem));
      },
      onUpdate: (updatedItem) => {
        setItems((prev) =>
          sortItems(prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)))
        );
      },
      onDelete: (deletedItem) => {
        setItems((prev) => prev.filter((i) => i.id !== deletedItem.id));
      },
    });

    return unsubscribe;
  }, [code, roomExists]);

  const handleCopyCode = async () => {
    await copyToClipboard(code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Live Clipboard Room',
          text: `Join my clipboard room: ${code}`,
          url: roomUrl,
        });
        return;
      } catch {
        // User cancelled or share failed — fall through to copy
      }
    }

    await copyToClipboard(roomUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleAddText = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    setError('');
    setSaving(true);
    const { item, error: saveError } = await addTextItem(code, trimmed);
    setSaving(false);

    if (saveError || !item) {
      setError('Failed to save text. Please try again.');
      return;
    }

    setText('');
    setItems((prev) => upsertItem(prev, item));
  };

  const handleUpload = async (file) => {
    setError('');
    setUploading(true);
    const { item, error: uploadError } = await uploadFile(code, file);
    setUploading(false);

    if (uploadError || !item) {
      setError('Failed to upload file. Please try again.');
      return;
    }

    setItems((prev) => upsertItem(prev, item));
  };

  if (loading) {
    return (
      <div className="page room-page">
        <LoadingState message="Loading room..." />
      </div>
    );
  }

  if (!roomExists) {
    return (
      <div className="page room-page">
        <div className="card not-found-card">
          <h2>Room not found</h2>
          <p>The room code <strong>{code}</strong> does not exist or has expired.</p>
          <Link to="/" className="btn btn-primary">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page room-page">
      <header className="room-header card">
        <div className="room-header__top">
          <Link to="/" className="btn btn-ghost btn-sm back-link">
            <ArrowLeft size={16} />
            Home
          </Link>
          <div className="room-code-display">
            <span className="room-code-label">Room</span>
            <span className="room-code">{code}</span>
          </div>
        </div>
        <div className="room-header__actions">
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleCopyCode}>
            {codeCopied ? <Check size={14} /> : <Copy size={14} />}
            {codeCopied ? 'Copied!' : 'Copy Code'}
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleShare}>
            <Share2 size={14} />
            {linkCopied ? 'Link Copied!' : 'Share Room'}
          </button>
        </div>
      </header>

      <section className="compose card">
        <form onSubmit={handleAddText} className="compose-form">
          <textarea
            className="textarea"
            placeholder="Type or paste text to share..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            disabled={saving || uploading}
          />
          <div className="compose-actions">
            <FileUpload onUpload={handleUpload} uploading={uploading} disabled={saving} />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving || uploading || !text.trim()}
            >
              <Send size={16} />
              {saving ? 'Saving...' : 'Add'}
            </button>
          </div>
        </form>
        {error && <p className="error-message">{error}</p>}
      </section>

      <section className="clipboard-list">
        <h2 className="section-title">Clipboard</h2>
        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="clipboard-items">
            {items.map((item) => (
              <ClipboardItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
