import { supabase } from './supabase';
import { generateRoomCode } from '../utils/roomCode';
import { buildStoragePath } from '../utils/fileHelpers';

const BUCKET = 'clipboard-files';

export async function createRoom() {
  let roomCode = generateRoomCode();
  let attempts = 0;

  while (attempts < 5) {
    const { data, error } = await supabase
      .from('clipboard_rooms')
      .insert({ room_code: roomCode, title: `Room ${roomCode}` })
      .select()
      .single();

    if (!error) return { room: data, error: null };

    if (error.code === '23505') {
      roomCode = generateRoomCode();
      attempts++;
      continue;
    }

    return { room: null, error };
  }

  return { room: null, error: new Error('Could not generate a unique room code') };
}

export async function joinRoom(roomCode) {
  const code = roomCode.trim().toUpperCase();
  const { data, error } = await supabase
    .from('clipboard_rooms')
    .select('*')
    .eq('room_code', code)
    .maybeSingle();

  if (error) return { room: null, error };
  if (!data) return { room: null, error: null };
  return { room: data, error: null };
}

export async function fetchRoom(roomCode) {
  return joinRoom(roomCode);
}

export async function fetchClipboardItems(roomCode) {
  const { data, error } = await supabase
    .from('clipboard_items')
    .select('*')
    .eq('room_code', roomCode.toUpperCase())
    .order('created_at', { ascending: false });

  return { items: data ?? [], error };
}

export async function addTextItem(roomCode, text) {
  const trimmed = text.trim();
  if (!trimmed) {
    return { item: null, error: new Error('Text cannot be empty') };
  }

  const { data, error } = await supabase
    .from('clipboard_items')
    .insert({
      room_code: roomCode.toUpperCase(),
      type: 'text',
      content: trimmed,
    })
    .select()
    .single();

  return { item: data, error };
}

export async function uploadFile(roomCode, file) {
  const path = buildStoragePath(roomCode.toUpperCase(), file.name);

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false });

  if (uploadError) return { item: null, error: uploadError };

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const fileUrl = urlData.publicUrl;
  const type = file.type.startsWith('image/') ? 'image' : 'file';

  const { data, error } = await supabase
    .from('clipboard_items')
    .insert({
      room_code: roomCode.toUpperCase(),
      type,
      file_url: fileUrl,
      file_name: file.name,
      file_type: file.type,
    })
    .select()
    .single();

  return { item: data, error };
}

export function joinLiveText(roomCode, { onText, getCurrentText }) {
  const code = roomCode.toUpperCase();
  const channel = supabase.channel(`live-${code}`, {
    config: { broadcast: { self: false } },
  });

  channel
    .on('broadcast', { event: 'text' }, ({ payload }) => {
      onText(payload.text);
    })
    .on('broadcast', { event: 'request-state' }, () => {
      const current = getCurrentText();
      if (current) {
        channel.send({ type: 'broadcast', event: 'text', payload: { text: current } });
      }
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({ type: 'broadcast', event: 'request-state', payload: {} });
      }
    });

  const sendText = (text) => {
    channel.send({ type: 'broadcast', event: 'text', payload: { text } });
  };

  const unsubscribe = () => {
    supabase.removeChannel(channel);
  };

  return { sendText, unsubscribe };
}

export function subscribeToRoom(roomCode, callbacks) {
  const code = roomCode.toUpperCase();
  const channel = supabase
    .channel(`room-${code}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'clipboard_items',
        filter: `room_code=eq.${code}`,
      },
      (payload) => {
        if (payload.eventType === 'INSERT' && callbacks.onInsert) {
          callbacks.onInsert(payload.new);
        } else if (payload.eventType === 'UPDATE' && callbacks.onUpdate) {
          callbacks.onUpdate(payload.new);
        } else if (payload.eventType === 'DELETE' && callbacks.onDelete) {
          callbacks.onDelete(payload.old);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
