create function public.review_application(target_user_id uuid, decision public.account_status)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  application public.profiles%rowtype;
begin
  if not public.is_admin() then
    raise exception using errcode = '42501', message = 'Admin access required';
  end if;
  if decision not in ('APPROVED', 'REJECTED') then
    raise exception using errcode = '22023', message = 'Invalid review decision';
  end if;

  select * into application from public.profiles where id = target_user_id for update;
  if not found then raise exception using errcode = 'P0002', message = 'Application not found'; end if;
  if application.account_status <> 'PENDING' then
    raise exception using errcode = '23514', message = 'Application is no longer pending';
  end if;

  update public.profiles
  set account_status = decision,
      role = case when decision = 'APPROVED' then application.requested_role else null end
  where id = target_user_id;

  insert into public.notifications (recipient_id, type, title, message, entity_type, entity_id)
  values (
    target_user_id,
    'APPLICATION_' || decision::text,
    case when decision = 'APPROVED' then 'Application approved' else 'Application not approved' end,
    case when decision = 'APPROVED' then 'Your CampusConnect account is ready.' else 'Contact the school administrator if you need more information.' end,
    'profile', target_user_id
  );
end;
$$;

revoke all on function public.review_application(uuid, public.account_status) from public;
grant execute on function public.review_application(uuid, public.account_status) to authenticated;
