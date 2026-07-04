-- Run this in Supabase SQL Editor if room expiry updates fail.

-- Allow anon users to update room expiry
create policy "public update rooms"
  on clipboard_rooms
  for update
  using (true)
  with check (true);

-- If policies already exist with different names, you may get "already exists" — that's fine.
-- Also ensure these exist for full app functionality:

-- create policy "public read rooms" on clipboard_rooms for select using (true);
-- create policy "public insert rooms" on clipboard_rooms for insert with check (true);
-- create policy "public read items" on clipboard_items for select using (true);
-- create policy "public insert items" on clipboard_items for insert with check (true);

-- Enable realtime for clipboard items:
-- alter publication supabase_realtime add table clipboard_items;
