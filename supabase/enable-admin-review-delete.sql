drop policy if exists "admin delete reviews" on public.reviews;
create policy "admin delete reviews"
on public.reviews for delete
using (public.is_admin());
