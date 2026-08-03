-- Auto-confirm emails so password signup returns a session immediately.
-- Revisit before production launch if you want email verification enabled.

create or replace function private.auto_confirm_email()
returns trigger
language plpgsql
security definer
set search_path = auth
as $$
begin
  new.email_confirmed_at = coalesce(new.email_confirmed_at, now());
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_auto_confirm on auth.users;
create trigger on_auth_user_created_auto_confirm
  before insert on auth.users
  for each row execute function private.auto_confirm_email();

revoke all on function private.auto_confirm_email() from public;
