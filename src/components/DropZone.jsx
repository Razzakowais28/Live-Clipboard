import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

export default function DropZone({ onUpload, uploading, uploadProgress, disabled, children }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = async (fileList) => {
    const file = fileList?.[0];
    if (!file || disabled || uploading) return;
    await onUpload(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleChange = (e) => handleFiles(e.target.files);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled && !uploading) setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (disabled || uploading) return;
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      className={`drop-zone ${dragging ? 'drop-zone--active' : ''} ${uploading ? 'drop-zone--uploading' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        id="file-upload"
        className="file-upload__input"
        accept="image/*,.pdf,.doc,.docx,.txt,.zip,.xls,.xlsx,.ppt,.pptx"
        onChange={handleChange}
        disabled={disabled || uploading}
      />
      {children}
      {uploading && (
        <div className="upload-progress">
          <div className="upload-progress__bar" style={{ width: `${uploadProgress}%` }} />
        </div>
      )}
      {dragging && (
        <div className="drop-zone__overlay">
          <Upload size={28} />
          <span>Drop file to upload</span>
        </div>
      )}
    </div>
  );
}
