-- SECURITY DEFINER function to create employer profile during signup
-- This bypasses RLS since auth.uid() is not available until session cookies are set
create or replace function public.create_employer_profile(
  p_user_id uuid,
  p_name text,
  p_slug text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into employers (user_id, name, slug)
  values (p_user_id, p_name, p_slug);
end;
$$;

-- Grant execute to authenticated users and anon (signup flow)
grant execute on function public.create_employer_profile(uuid, text, text) to anon, authenticated;
