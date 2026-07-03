import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LogIn, Clipboard } from 'lucide-react';
import { createRoom, joinRoom } from '../lib/clipboard';
import { useToast } from '../context/ToastContext';

export default function Home() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [roomInput, setRoomInput] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    setError('');
    setCreating(true);
    const { room, error: createError } = await createRoom();
    setCreating(false);

    if (createError || !room) {
      setError('Failed to create room. Please try again.');
      showToast('Could not create room', 'error');
      return;
    }

    showToast('Room created');
    navigate(`/room/${room.room_code}`);
  };

  const handleJoin = async (e) => {
    e?.preventDefault();
    const code = roomInput.trim().toUpperCase();
    if (!code) {
      setError('Please enter a room code.');
      return;
    }

    setError('');
    setJoining(true);
    const { room, error: joinError } = await joinRoom(code);
    setJoining(false);

    if (joinError) {
      setError('Failed to join room. Please try again.');
      showToast('Join failed', 'error');
      return;
    }

    if (!room) {
      setError('Room not found. Check the code and try again.');
      showToast('Room not found', 'error');
      return;
    }

    navigate(`/room/${room.room_code}`);
  };

  return (
    <div className="page home-page">
      <div className="home-card card">
        <div className="home-logo">
          <Clipboard size={28} />
        </div>
        <h1 className="home-title">Live Clipboard</h1>
        <p className="home-subtitle">
          Share text, images, and files instantly across devices.
        </p>

        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={handleCreate}
          disabled={creating || joining}
        >
          <Plus size={18} />
          {creating ? 'Creating...' : 'Create Room'}
        </button>

        <div className="divider">
          <span>or join existing</span>
        </div>

        <form onSubmit={handleJoin} className="join-form">
          <input
            type="text"
            className="input"
            placeholder="Enter room code"
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
            maxLength={6}
            disabled={creating || joining}
          />
          <button
            type="submit"
            className="btn btn-secondary btn-block"
            disabled={creating || joining}
          >
            <LogIn size={18} />
            {joining ? 'Joining...' : 'Join Room'}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}
