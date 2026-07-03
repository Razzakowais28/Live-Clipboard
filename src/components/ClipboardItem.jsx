import { useState } from 'react';
import {
  Copy,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  File,
  Link2,
  Pin,
  PinOff,
} from 'lucide-react';
import { copyToClipboard, formatDate } from '../utils/fileHelpers';
import { isLink } from '../utils/itemHelpers';
import ImageModal from './ImageModal';

export default function ClipboardItem({ item, pinned, onTogglePin, onCopy }) {
  const [copied, setCopied] = useState(false);
  const [showImage, setShowImage] = useState(false);

  const handleCopy = async () => {
    const text = item.type === 'text' ? item.content : item.file_url;
    await copyToClipboard(text);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  const category = item.type === 'text' && isLink(item.content) ? 'link' : item.type;

  const typeIcon = {
    text: <FileText size={15} />,
    link: <Link2 size={15} />,
    image: <ImageIcon size={15} />,
    file: <File size={15} />,
  };

  const linkUrl = item.type === 'text' && isLink(item.content) ? item.content.trim() : null;

  return (
    <>
      <article className={`clipboard-item ${pinned ? 'clipboard-item--pinned' : ''}`}>
        <div className="clipboard-item__header">
          <span className="clipboard-item__type">
            {typeIcon[category]}
            {category}
          </span>
          <div className="clipboard-item__actions">
            <button
              type="button"
              className="icon-btn"
              onClick={onTogglePin}
              title={pinned ? 'Unpin' : 'Pin'}
              aria-label={pinned ? 'Unpin item' : 'Pin item'}
            >
              {pinned ? <PinOff size={14} /> : <Pin size={14} />}
            </button>
            <time className="clipboard-item__date">{formatDate(item.created_at)}</time>
          </div>
        </div>

        {item.type === 'text' && !linkUrl && (
          <div className="clipboard-item__body">
            <p className="clipboard-item__text">{item.content}</p>
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleCopy}>
              <Copy size={14} />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}

        {linkUrl && (
          <div className="clipboard-item__body">
            <a
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="link-preview"
            >
              <span className="link-preview__icon">
                <Link2 size={18} />
              </span>
              <span className="link-preview__content">
                <span className="link-preview__url">{linkUrl}</span>
                <span className="link-preview__hint">Tap to open</span>
              </span>
            </a>
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleCopy}>
              <Copy size={14} />
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
        )}

        {item.type === 'image' && (
          <div className="clipboard-item__body">
            <button
              type="button"
              className="clipboard-item__image-btn"
              onClick={() => setShowImage(true)}
            >
              <img
                src={item.file_url}
                alt={item.file_name}
                className="clipboard-item__image"
                loading="lazy"
              />
            </button>
            <div className="clipboard-item__file-info">
              <span className="clipboard-item__filename">{item.file_name}</span>
              <a
                href={item.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm"
              >
                <ExternalLink size={14} />
                Open
              </a>
            </div>
          </div>
        )}

        {item.type === 'file' && (
          <div className="clipboard-item__body">
            <div className="clipboard-item__file-row">
              <div className="clipboard-item__file-meta">
                <File size={20} className="clipboard-item__file-icon" />
                <div>
                  <p className="clipboard-item__filename">{item.file_name}</p>
                  <p className="clipboard-item__filetype">{item.file_type || 'File'}</p>
                </div>
              </div>
              <a
                href={item.file_url}
                target="_blank"
                rel="noopener noreferrer"
                download={item.file_name}
                className="btn btn-ghost btn-sm"
              >
                <ExternalLink size={14} />
                Download
              </a>
            </div>
          </div>
        )}
      </article>

      {showImage && (
        <ImageModal
          src={item.file_url}
          alt={item.file_name}
          onClose={() => setShowImage(false)}
        />
      )}
    </>
  );
}
