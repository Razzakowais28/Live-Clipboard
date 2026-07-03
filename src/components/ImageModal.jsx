import { X } from 'lucide-react';

export default function ImageModal({ src, alt, onClose }) {
  return (
    <div className="modal-overlay modal-overlay--dark" onClick={onClose} role="presentation">
      <button type="button" className="image-modal__close" onClick={onClose} aria-label="Close">
        <X size={20} />
      </button>
      <img
        src={src}
        alt={alt}
        className="image-modal__img"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
