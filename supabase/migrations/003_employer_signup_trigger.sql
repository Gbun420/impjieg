-- Auto-create employer profile when a new user signs up
-- This runs AFTER the user is fully committed to auth.users

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slug text;
begin
  -- Generate a unique slug from metadata or email
  v_slug := lower(regexp_replace(new.raw_user_meta_data->>'companyName', '[^a-zA-Z0-9]+', '-', 'g'));
  if v_slug is null or v_slug = '' then
    v_slug := 'employer';
  end if;
  v_slug := v_slug || '-' || substr(md5(random()::text), 1, 4);

  insert into public.employers (user_id, name, slug)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'companyName', 'New Employer'),
    v_slug
  );

  return new;
end;
$$;

-- Drop existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
