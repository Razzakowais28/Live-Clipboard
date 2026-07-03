import { QRCodeSVG } from 'qrcode.react';
import { X } from 'lucide-react';

export default function QRModal({ url, roomCode, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="modal card" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Room QR code">
        <div className="modal__header">
          <h3>Scan to Join</h3>
          <button type="button" className="btn btn-ghost btn-sm modal__close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <p className="modal__subtitle">Room <strong>{roomCode}</strong></p>
        <div className="qr-wrap">
          <QRCodeSVG value={url} size={200} level="M" includeMargin />
        </div>
        <p className="modal__hint">Open your phone camera and scan to join this room.</p>
      </div>
    </div>
  );
}
