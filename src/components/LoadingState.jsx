import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="loading-state">
      <Loader2 className="loading-state__icon" size={24} />
      <p>{message}</p>
    </div>
  );
}
