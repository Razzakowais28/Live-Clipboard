import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Copy, Share2, Check, Radio } from 'lucide-react';
import {
  fetchRoom,
  fetchClipboardItems,
  uploadFile,
  subscribeToRoom,
  joinLiveText,
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
  const [liveText, setLiveText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);

  const liveTextRef = useRef('');
  const sendTextRef = useRef(null);

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

    const { sendText, unsubscribe } = joinLiveText(code, {
      onText: (incoming) => {
        liveTextRef.current = incoming;
        setLiveText(incoming);
      },
      getCurrentText: () => liveTextRef.current,
    });

    sendTextRef.current = sendText;

    return () => {
      sendTextRef.current = null;
      unsubscribe();
    };
  }, [code, roomExists]);

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

  const handleLiveTextChange = (e) => {
    const value = e.target.value;
    liveTextRef.current = value;
    setLiveText(value);
    if (sendTextRef.current) {
      sendTextRef.current(value);
    }
  };

  const handleCopyCode = async () => {
    await copyToClipboard(code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleCopyText = async () => {
    if (!liveText) return;
    await copyToClipboard(liveText);
    setTextCopied(true);
    setTimeout(() => setTextCopied(false), 2000);
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
        <div className="live-header">
          <span className="live-badge">
            <Radio size={14} />
            Live
          </span>
          <span className="live-hint">Type here — everyone in this room sees it instantly.</span>
        </div>
        <textarea
          className="textarea"
          placeholder="Start typing to share with everyone..."
          value={liveText}
          onChange={handleLiveTextChange}
          rows={6}
        />
        <div className="compose-actions">
          <FileUpload onUpload={handleUpload} uploading={uploading} />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCopyText}
            disabled={!liveText}
          >
            {textCopied ? <Check size={16} /> : <Copy size={16} />}
            {textCopied ? 'Copied!' : 'Copy Text'}
          </button>
        </div>
        {error && <p className="error-message">{error}</p>}
      </section>

      <section className="clipboard-list">
        <h2 className="section-title">Files</h2>
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
