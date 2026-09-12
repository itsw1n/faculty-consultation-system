create function public.create_notification(recipient uuid,notification_type text,notification_title text,notification_message text,related_type text default null,related_id uuid default null)
returns void language sql security definer set search_path='' as $$
insert into public.notifications(recipient_id,type,title,message,entity_type,entity_id) values(recipient,notification_type,notification_title,notification_message,related_type,related_id)
$$;
revoke all on function public.create_notification(uuid,text,text,text,text,uuid) from public;

create function public.notify_admins_of_application()
returns trigger language plpgsql security definer set search_path='' as $$
declare admin_id uuid;
begin
  if new.account_status='PENDING' and old.account_status is distinct from 'PENDING' then
    for admin_id in select id from public.profiles where role='ADMIN' and account_status='APPROVED' loop
      perform public.create_notification(admin_id,'NEW_APPLICATION','New account application',new.full_name||' submitted an application.','profile',new.id);
    end loop;
  end if;
  return new;
end $$;
create trigger profiles_notify_admins_after_application after update of account_status on public.profiles for each row execute function public.notify_admins_of_application();

create function public.notify_consultation_completion()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  if new.status='COMPLETED' and old.status='APPROVED' then
    perform public.create_notification(new.student_id,'CONSULTATION_COMPLETED','Consultation completed','Your faculty member marked the consultation as completed.','consultation',new.id);
  end if;
  return new;
end $$;
create trigger consultations_notify_after_completion after update of status on public.consultations for each row execute function public.notify_consultation_completion();
