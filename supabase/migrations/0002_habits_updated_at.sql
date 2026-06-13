-- Server-authoritative updated_at on public.habits.
--
-- Why: sync uses updated_at for per-record last-write-wins. Stamping it on the
-- server (not the client) removes the dependency on each device's clock, so a
-- device with a skewed clock can't wrongly win or lose a merge.
--
-- Why the guard (not a plain "set now() on every update"): the client does a
-- full pull→merge→push on each sync, re-upserting *every* local row — including
-- unchanged ones. A naive trigger would rewrite every timestamp to now() on
-- each sync, making last-write-wins meaningless. So we only bump updated_at
-- when the habit's actual data changed; a no-op re-upsert keeps the old stamp.

create or replace function public.habits_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE'
     and new.name       is not distinct from old.name
     and new.history    is not distinct from old.history
     and new.deleted_at is not distinct from old.deleted_at then
    -- Nothing meaningful changed (e.g. a sync re-upsert) — preserve the stamp.
    new.updated_at := old.updated_at;
  else
    new.updated_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists habits_set_updated_at on public.habits;

create trigger habits_set_updated_at
  before insert or update on public.habits
  for each row
  execute function public.habits_set_updated_at();
