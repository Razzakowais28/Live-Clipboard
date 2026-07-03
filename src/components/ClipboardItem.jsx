import { useState } from 'react';
import { Copy, ExternalLink, FileText, Image, File } from 'lucide-react';
import { copyToClipboard, formatDate } from '../utils/fileHelpers';

export default function ClipboardItem({ item }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(item.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const typeIcon = {
    text: <FileText size={16} />,
    image: <Image size={16} />,
    file: <File size={16} />,
  };

  return (
    <article className="clipboard-item">
      <div className="clipboard-item__header">
        <span className="clipboard-item__type">
          {typeIcon[item.type]}
          {item.type}
        </span>
        <time className="clipboard-item__date">{formatDate(item.created_at)}</time>
      </div>

      {item.type === 'text' && (
        <div className="clipboard-item__body">
          <p className="clipboard-item__text">{item.content}</p>
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleCopy}>
            <Copy size={14} />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}

      {item.type === 'image' && (
        <div className="clipboard-item__body">
          <img
            src={item.file_url}
            alt={item.file_name}
            className="clipboard-item__image"
            loading="lazy"
          />
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
            <div>
              <p className="clipboard-item__filename">{item.file_name}</p>
              <p className="clipboard-item__filetype">{item.file_type || 'Unknown type'}</p>
            </div>
            <a
              href={item.file_url}
              target="_blank"
              rel="noopener noreferrer"
              download={item.file_name}
              className="btn btn-ghost btn-sm"
            >
              <ExternalLink size={14} />
              Open
            </a>
          </div>
        </div>
      )}
    </article>
  );
}
