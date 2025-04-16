-- Create the cakes bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('cakes', 'cakes', true)
on conflict (id) do nothing;

-- Drop existing policies if they exist
drop policy if exists "Users can upload their own cake" on storage.objects;
drop policy if exists "Anyone can view cakes" on storage.objects;
drop policy if exists "Users can update their own cake" on storage.objects;
drop policy if exists "Users can delete their own cake" on storage.objects;

-- Create policies for the cakes bucket
create policy "Users can upload their own cake"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'cakes'
    AND (SPLIT_PART(name, '/', 1) = auth.uid()::text)
);

create policy "Anyone can view cakes"
on storage.objects for select
to public
using (bucket_id = 'cakes');

create policy "Users can update their own cake"
on storage.objects for update
to authenticated
using (
    bucket_id = 'cakes'
    AND (SPLIT_PART(name, '/', 1) = auth.uid()::text)
)
with check (
    bucket_id = 'cakes'
    AND (SPLIT_PART(name, '/', 1) = auth.uid()::text)
);

create policy "Users can delete their own cake"
on storage.objects for delete
to authenticated
using (
    bucket_id = 'cakes'
    AND (SPLIT_PART(name, '/', 1) = auth.uid()::text)
); 