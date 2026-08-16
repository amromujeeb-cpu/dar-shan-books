-- Dar Shan: run this entire file once in Supabase > SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  address text not null default '',
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);
alter table public.profiles add column if not exists address text not null default '';

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  category text not null,
  publisher text not null default '',
  price numeric(10,3) not null check (price >= 0),
  discount_price numeric(10,3),
  stock integer not null default 0 check (stock >= 0),
  low_stock integer not null default 10 check (low_stock >= 0),
  description text not null default '',
  isbn text not null default '',
  pages integer not null default 0 check (pages >= 0),
  cover_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  customer text not null,
  phone text not null,
  address text not null,
  total numeric(10,3) not null check (total >= 0),
  status text not null default 'قيد التجهيز',
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  book_id uuid references public.books(id) on delete set null,
  title text not null,
  quantity integer not null check (quantity > 0),
  price numeric(10,3) not null check (price >= 0)
);

create table if not exists public.store_settings (
  id integer primary key default 1 check (id = 1),
  promo_code text not null default 'SHAAN10',
  promo_percent integer not null default 10 check (promo_percent between 0 and 90),
  promo_active boolean not null default true,
  phone text not null default '',
  whatsapp text not null default '',
  email text not null default '',
  facebook_url text not null default '',
  instagram_url text not null default '',
  working_hours text not null default '10:00–19:00',
  address text not null default 'عمّان، الأردن',
  updated_at timestamptz not null default now()
);
alter table public.store_settings add column if not exists address text not null default 'عمّان، الأردن';
insert into public.store_settings(id) values(1) on conflict(id) do nothing;

create table if not exists public.featured_books (
  book_id uuid primary key references public.books(id) on delete cascade,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.book_drafts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id, book_id)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  display_name text not null,
  stars integer not null check(stars between 1 and 5),
  body text not null,
  approved boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin') $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  insert into public.profiles(id, full_name, role)
  values(new.id, coalesce(new.raw_user_meta_data->>'full_name',new.raw_user_meta_data->>'name',''), 'customer')
  on conflict(id) do nothing;
  update public.profiles set phone=coalesce(new.raw_user_meta_data->>'phone','') where id=new.id;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.store_settings enable row level security;
alter table public.featured_books enable row level security;
alter table public.book_drafts enable row level security;
alter table public.favorites enable row level security;
alter table public.reviews enable row level security;

drop policy if exists "profiles own read" on public.profiles;
create policy "profiles own read" on public.profiles for select using (id = auth.uid() or public.is_admin());
drop policy if exists "profiles own update" on public.profiles;
create policy "profiles own update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists "published books public read" on public.books;
create policy "published books public read" on public.books for select using (is_published or public.is_admin());
drop policy if exists "admin insert books" on public.books;
create policy "admin insert books" on public.books for insert with check (public.is_admin());
drop policy if exists "admin update books" on public.books;
create policy "admin update books" on public.books for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin delete books" on public.books;
create policy "admin delete books" on public.books for delete using (public.is_admin());
drop policy if exists "orders own read" on public.orders;
create policy "orders own read" on public.orders for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "orders own insert" on public.orders;
create policy "orders own insert" on public.orders for insert with check (user_id = auth.uid());
drop policy if exists "admin update orders" on public.orders;
create policy "admin update orders" on public.orders for update using (public.is_admin());
drop policy if exists "order items read" on public.order_items;
create policy "order items read" on public.order_items for select using (
  exists(select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
);
drop policy if exists "order items insert" on public.order_items;
create policy "order items insert" on public.order_items for insert with check (
  exists(select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
);
drop policy if exists "settings public read" on public.store_settings;
create policy "settings public read" on public.store_settings for select using (true);
drop policy if exists "settings admin update" on public.store_settings;
create policy "settings admin update" on public.store_settings for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "featured public read" on public.featured_books;
create policy "featured public read" on public.featured_books for select using (true);
drop policy if exists "featured admin insert" on public.featured_books;
create policy "featured admin insert" on public.featured_books for insert with check (public.is_admin());
drop policy if exists "featured admin delete" on public.featured_books;
create policy "featured admin delete" on public.featured_books for delete using (public.is_admin());
drop policy if exists "drafts admin all" on public.book_drafts;
create policy "drafts admin all" on public.book_drafts for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "favorites own read" on public.favorites;
create policy "favorites own read" on public.favorites for select using (user_id=auth.uid());
drop policy if exists "favorites own insert" on public.favorites;
create policy "favorites own insert" on public.favorites for insert with check (user_id=auth.uid());
drop policy if exists "favorites own delete" on public.favorites;
create policy "favorites own delete" on public.favorites for delete using (user_id=auth.uid());
drop policy if exists "reviews public read" on public.reviews;
create policy "reviews public read" on public.reviews for select using (approved or public.is_admin());
drop policy if exists "reviews auth insert" on public.reviews;
create policy "reviews auth insert" on public.reviews for insert with check (auth.uid() is not null and user_id=auth.uid());
drop policy if exists "admin delete reviews" on public.reviews;
create policy "admin delete reviews" on public.reviews for delete using (public.is_admin());

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values('book-covers','book-covers',true,4194304,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=true, file_size_limit=4194304;

drop policy if exists "covers public read" on storage.objects;
create policy "covers public read" on storage.objects for select using (bucket_id='book-covers');
drop policy if exists "admin upload covers" on storage.objects;
create policy "admin upload covers" on storage.objects for insert with check (bucket_id='book-covers' and public.is_admin());
drop policy if exists "admin update covers" on storage.objects;
create policy "admin update covers" on storage.objects for update using (bucket_id='book-covers' and public.is_admin());
drop policy if exists "admin delete covers" on storage.objects;
create policy "admin delete covers" on storage.objects for delete using (bucket_id='book-covers' and public.is_admin());

-- API roles need table privileges in addition to RLS policies.
grant usage on schema public to anon, authenticated;
grant select on public.books, public.store_settings, public.featured_books, public.reviews to anon, authenticated;
grant select, insert, update, delete on public.profiles, public.books, public.orders, public.order_items,
  public.store_settings, public.featured_books, public.book_drafts, public.favorites, public.reviews to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- After signing up with the manager email, run once and replace the email if needed:
-- update public.profiles set role='admin' where id=(select id from auth.users where email='admin@darshan.jo');
