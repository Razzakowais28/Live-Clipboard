import { useRef } from 'react';
import { Upload } from 'lucide-react';

export default function FileUpload({ onUpload, uploading, disabled }) {
  const inputRef = useRef(null);

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await onUpload(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="file-upload">
      <input
        ref={inputRef}
        type="file"
        id="file-upload"
        className="file-upload__input"
        accept="image/*,.pdf,.doc,.docx,.txt,.zip,.xls,.xlsx,.ppt,.pptx"
        onChange={handleChange}
        disabled={disabled || uploading}
      />
      <label htmlFor="file-upload" className={`btn btn-secondary ${uploading ? 'btn-disabled' : ''}`}>
        <Upload size={16} />
        {uploading ? 'Uploading...' : 'Upload File'}
      </label>
    </div>
  );
}
