import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Room from './pages/Room';
import { isSupabaseConfigured } from './lib/supabase';

function ConfigError() {
  return (
    <div className="page home-page">
      <div className="home-card card">
        <h1 className="home-title">Live Clipboard</h1>
        <p className="home-subtitle">Configuration required</p>
        <p className="error-message">
          Missing Supabase environment variables. Add{' '}
          <strong>VITE_SUPABASE_URL</strong> and{' '}
          <strong>VITE_SUPABASE_ANON_KEY</strong> in your hosting provider's
          environment settings, then redeploy.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  if (!isSupabaseConfigured) {
    return <ConfigError />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomCode" element={<Room />} />
      </Routes>
    </BrowserRouter>
  );
}
