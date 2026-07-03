import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Copy,
  Share2,
  Radio,
  QrCode,
  Upload,
  ClipboardPaste,
  Eraser,
  Users,
  Clock,
} from 'lucide-react';
import {
  fetchRoom,
  fetchClipboardItems,
  uploadFile,
  subscribeToRoom,
  joinLiveText,
  joinRoomPresence,
  updateRoomExpiry,
} from '../lib/clipboard';
import { copyToClipboard } from '../utils/fileHelpers';
import {
  filterItems,
  getItemCategory,
  loadPinnedIds,
  savePinnedIds,
  sortWithPinned,
} from '../utils/itemHelpers';
import { useToast } from '../context/ToastContext';
import ClipboardItem from '../components/ClipboardItem';
import DropZone from '../components/DropZone';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import HistoryTabs from '../components/HistoryTabs';
import QRModal from '../components/QRModal';

const EXPIRY_OPTIONS = [
  { label: '1 hour', hours: 1 },
  { label: '24 hours', hours: 24 },
  { label: '7 days', hours: 168 },
];

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

function formatExpiry(expiresAt) {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt) - Date.now();
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Expires in < 1 hour';
  if (hours < 24) return `Expires in ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Expires in ${days}d`;
}

export default function Room() {
  const { roomCode } = useParams();
  const code = roomCode?.toUpperCase() ?? '';
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState(null);
  const [roomExists, setRoomExists] = useState(false);
  const [items, setItems] = useState([]);
  const [liveText, setLiveText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [deviceCount, setDeviceCount] = useState(1);
  const [pinnedIds, setPinnedIds] = useState(() => loadPinnedIds(code));
  const [expiryHours, setExpiryHours] = useState(24);

  const liveTextRef = useRef('');
  const sendTextRef = useRef(null);
  const textareaRef = useRef(null);
  const progressTimerRef = useRef(null);

  const roomUrl = `${window.location.origin}/room/${code}`;

  const loadRoom = useCallback(async () => {
    setLoading(true);
    setError('');

    const { room: fetchedRoom, error: roomError } = await fetchRoom(code);
    if (roomError) {
      setError('Failed to load room.');
      setLoading(false);
      return;
    }

    if (!fetchedRoom) {
      setRoomExists(false);
      setLoading(false);
      return;
    }

    setRoom(fetchedRoom);
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
    setPinnedIds(loadPinnedIds(code));
  }, [code]);

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
        showToast('New item received', 'info');
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
  }, [code, roomExists, showToast]);

  useEffect(() => {
    if (!roomExists) return;
    return joinRoomPresence(code, setDeviceCount);
  }, [code, roomExists]);

  const simulateProgress = useCallback(() => {
    setUploadProgress(0);
    clearInterval(progressTimerRef.current);
    progressTimerRef.current = setInterval(() => {
      setUploadProgress((p) => (p >= 90 ? p : p + 12));
    }, 200);
  }, []);

  const handleUpload = useCallback(async (file) => {
    setError('');
    setUploading(true);
    simulateProgress();

    const { item, error: uploadError } = await uploadFile(code, file);

    clearInterval(progressTimerRef.current);
    setUploadProgress(100);
    setUploading(false);

    setTimeout(() => setUploadProgress(0), 400);

    if (uploadError || !item) {
      setError('Failed to upload file. Please try again.');
      showToast('Upload failed', 'error');
      return;
    }

    setItems((prev) => upsertItem(prev, item));
    showToast('File uploaded');
  }, [code, showToast, simulateProgress]);

  useEffect(() => {
    if (!roomExists) return;

    const handlePaste = async (e) => {
      const clipboardItems = e.clipboardData?.items;
      if (!clipboardItems) return;

      for (const entry of clipboardItems) {
        if (entry.type.startsWith('image/')) {
          e.preventDefault();
          const file = entry.getAsFile();
          if (file) {
            const named = new File([file], `paste-${Date.now()}.png`, { type: file.type });
            await handleUpload(named);
          }
          return;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [roomExists, handleUpload]);

  const handleLiveTextChange = (e) => {
    const value = e.target.value;
    liveTextRef.current = value;
    setLiveText(value);
    sendTextRef.current?.(value);
  };

  const handleCopyCode = async () => {
    await copyToClipboard(code);
    showToast('Room code copied');
  };

  const handleCopyText = async () => {
    if (!liveText) return;
    await copyToClipboard(liveText);
    showToast('Copied to clipboard');
  };

  const handleClearText = () => {
    liveTextRef.current = '';
    setLiveText('');
    sendTextRef.current?.('');
    showToast('Live text cleared', 'info');
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
        // cancelled
      }
    }
    await copyToClipboard(roomUrl);
    showToast('Room link copied');
  };

  const handleTogglePin = (itemId) => {
    setPinnedIds((prev) => {
      const next = prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId];
      savePinnedIds(code, next);
      return next;
    });
  };

  const handleExpiryChange = async (e) => {
    const hours = Number(e.target.value);
    setExpiryHours(hours);
    const { room: updated, error: expiryError } = await updateRoomExpiry(code, hours);
    if (expiryError || !updated) {
      showToast('Could not update expiry', 'error');
      return;
    }
    setRoom(updated);
    showToast(`Room expires in ${EXPIRY_OPTIONS.find((o) => o.hours === hours)?.label}`);
  };

  const tabCounts = useMemo(() => {
    const counts = { all: items.length, text: 0, images: 0, files: 0, links: 0 };
    items.forEach((item) => {
      const cat = getItemCategory(item);
      if (counts[cat] !== undefined) counts[cat]++;
    });
    return counts;
  }, [items]);

  const displayedItems = useMemo(() => {
    const filtered = filterItems(items, activeTab);
    return sortWithPinned(filtered, pinnedIds);
  }, [items, activeTab, pinnedIds]);

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

  const expiryLabel = formatExpiry(room?.expires_at);

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
        <div className="room-header__meta">
          <span className="room-meta-badge">
            <Clock size={13} />
            Temporary room
          </span>
          {expiryLabel && <span className="room-meta-text">{expiryLabel}</span>}
          <select
            className="expiry-select"
            value={expiryHours}
            onChange={handleExpiryChange}
            aria-label="Room expiry"
          >
            {EXPIRY_OPTIONS.map((opt) => (
              <option key={opt.hours} value={opt.hours}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="room-header__actions">
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleCopyCode}>
            <Copy size={14} />
            Copy Code
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowQR(true)}>
            <QrCode size={14} />
            Show QR
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleShare}>
            <Share2 size={14} />
            Share
          </button>
        </div>
      </header>

      <DropZone onUpload={handleUpload} uploading={uploading} uploadProgress={uploadProgress}>
        <section className="compose card">
          <div className="live-header">
            <div className="live-header__left">
              <span className="live-badge">
                <Radio size={13} />
                Live
              </span>
              <span className="presence-badge">
                <Users size={13} />
                {deviceCount} {deviceCount === 1 ? 'device' : 'devices'} connected
              </span>
            </div>
            <span className="live-hint">Type here — everyone sees it instantly</span>
          </div>

          <textarea
            ref={textareaRef}
            className="textarea"
            placeholder="Start typing to share with everyone..."
            value={liveText}
            onChange={handleLiveTextChange}
            rows={5}
          />

          <div className="toolbar">
            <label htmlFor="file-upload" className="btn btn-secondary btn-sm toolbar__btn">
              <Upload size={15} />
              Upload
            </label>
            <button
              type="button"
              className="btn btn-secondary btn-sm toolbar__btn"
              onClick={() => {
                textareaRef.current?.focus();
                showToast('Paste text or screenshot (Ctrl+V)', 'info');
              }}
            >
              <ClipboardPaste size={15} />
              Paste
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm toolbar__btn"
              onClick={handleClearText}
              disabled={!liveText}
            >
              <Eraser size={15} />
              Clear
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm toolbar__btn"
              onClick={handleCopyText}
              disabled={!liveText}
            >
              <Copy size={15} />
              Copy
            </button>
          </div>

          {uploading && (
            <p className="upload-status">Uploading… {uploadProgress}%</p>
          )}
          {error && <p className="error-message">{error}</p>}
        </section>
      </DropZone>

      <section className="clipboard-list">
        <h2 className="section-title">Clipboard History</h2>
        <HistoryTabs active={activeTab} onChange={setActiveTab} counts={tabCounts} />
        {displayedItems.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          <div className="clipboard-items">
            {displayedItems.map((item) => (
              <ClipboardItem
                key={item.id}
                item={item}
                pinned={pinnedIds.includes(item.id)}
                onTogglePin={() => handleTogglePin(item.id)}
                onCopy={() => showToast('Copied')}
              />
            ))}
          </div>
        )}
      </section>

      {showQR && (
        <QRModal url={roomUrl} roomCode={code} onClose={() => setShowQR(false)} />
      )}
    </div>
  );
}
